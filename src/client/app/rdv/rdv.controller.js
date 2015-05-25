(function () {
    'use strict';

    angular
        .module('app.rdv')
        .controller('RdvController', RdvController);

        RdvController.$inject = ['$q', 'dataservice', 'logger', 'authservice', '$sailsSocket', 'ngDialog'];

    /* @ngInject */
    function RdvController($q, dataservice, logger, authservice, $sailsSocket, ngDialog)
    {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.title = 'Rdv non confirmés';
        vm.appointments = [];
        vm.getNextAppointments = getNextAppointments;
        vm.getPreviousAppointments = getPreviousAppointments;
        vm.cancelAppointment = cancelAppointment;
        vm.remindAppointment = remindAppointment;

        var idCurrent = authservice.currentUser().id;
        vm.dateStart = moment();
        vm.dateStart.set('hour', 8);
        vm.dateStart.set('minute', 0);
        vm.dateStart.set('second', 0);
        vm.dateStart.set('millisecond', 0);

        activate();

        ////////////////


        function activate() {
            var promises = [getAppointments()];
            return $q.all(promises).then(function() {
            });
        }

        function getAppointments() {
            return dataservice.getPendingAppointmentsByDoctor(idCurrent, vm.dateStart).success(function (data) {
                vm.appointments = data;
                return data;
            }).error(function(err){
                console.log(err);
            })
        }

        function getPreviousAppointments() {
            vm.dateStart = moment(vm.dateStart).subtract(1, 'd');
            return dataservice.getPendingAppointmentsByDoctor(idCurrent, vm.dateStart).success(function (data) {
                vm.appointments = data;
                return data;
            }).error(function(err){
                console.log(err);
            })
        }

        function getNextAppointments() {
            vm.dateStart = moment(vm.dateStart).add(1, 'd');
            return dataservice.getPendingAppointmentsByDoctor(idCurrent, vm.dateStart).success(function (data) {
                vm.appointments = data;
                return data;
            }).error(function(err){
                console.log(err);
            })
        }

        function remindAppointment(appoint) {
            return dataservice.remindAppointment(appoint).success(function (data){
                console.log(data);
                logger.info('L\'email de rappel à été envoyé !')
                return data;
            }).error(function(err) {
              console.log(err);
            });
        }

        function cancelAppointment(id) {
          ngDialog.openConfirm({
            template: 'app/widgets/modalConfirm.html',
            className: 'ngdialog-theme-default',
            data: {message: 'Voulez-vous annuler ce rendez-vous ?'}
          }).then(function (value) {
            dataservice.cancelAppointment(id).success(function (data){
              angular.forEach(vm.appointments, function(app,key){
                  if(app.id == id ){
                      vm.appointments.splice(key, 1);
                  }
              })
              dataservice.incrNbCancelled(data.doctor);
            });
            logger.info('Le rendez-vous a été annulé !')
          }, function (reason) {
            console.log('Proposed Modal promise rejected. Reason: ', reason);
          });
        }
    }
})();
