(function () {
    'use strict';

    angular
        .module('app.patient')
        .controller('PatientController', PatientController);

    PatientController.$inject = ['$q', 'dataservice', 'logger', '$modal', 'authservice', '$sailsSocket'];

    /* @ngInject */
    function PatientController($q, dataservice, logger, $modal, authservice,$sailsSocket)
    {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.title = 'Mes rendez-vous';
        vm.patient = {};
        vm.appointments = [];

        var idCurrent = authservice.currentUser().id;
        activate();

        ////////////////
        //$sailsSocket.get('http://localhost:1337/patient').success(function(doctor){
        //    console.log(doctor)
        //}).error(function(error){
        //    console.log(error)
        //})

        function activate() {
            var promises = [getPatient(idCurrent), getAppointments(idCurrent)];
            return $q.all(promises).then(function() {
            });
        }

        function getPatient(id) {
            return dataservice.getPatientById(id).then(function (data) {
                vm.patient = data;
                return vm.patient;
            });
        }

        function getAppointments(id) {
            return dataservice.getAppointmentsByPatient(id).then(function (data) {
                vm.appointments = data;
                return vm.appointments;
            });
        }

        function validateAppointment(id) {
            dataservice.validateAppointment(id);
        }

        vm.open = function (id) {

            var modalInstance = $modal.open({
                templateUrl: 'app/widgets/modalContent.html',
                controller: ['$modalInstance',
                    function($modalInstance) {
                        var vm = this;

                        vm.ok = function () {
                            $modalInstance.close();
                        };

                        vm.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    }
                ],
                controllerAs: 'vm'
            });

            modalInstance.result.then(function () {
                validateAppointment(id);
                logger.info('Votre rendez-vous à bien été validé !');
            }, function () {
                logger.error('Veuillez entrer vos informations bancaires');
            });
        };
    }
})();
