(function () {
    'use strict';

    angular
        .module('app.admin')
        .controller('AdminController', AdminController);

    AdminController.$inject = ['logger', 'dataservice', '$q', 'authservice', '$sailsSocket', '$rootScope'];
    /* @ngInject */
    function AdminController(logger, dataservice, $q, authservice, $sailsSocket, $rootScope) {
        var vm = this;
        vm.title = 'Admin';
        vm.patients = [];
        vm.onSelect = onSelect;
        vm.appointments = [];
        vm.getPatientById = getPatientById;
        vm.cancelAppointment = cancelAppointment;
        vm.deleteAppointment = deleteAppointment;
        vm.addAppointment = addAppointment;
        vm.broadcastAppointment = broadcastAppointment;

        //DatePicker
        vm.dt = new Date();
        vm.dt.setHours(8);
        vm.dt.setMinutes(0);
        vm.minDate = new Date();
        vm.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };
        vm.clear = clear;
        vm.date = new Date();
        vm.date.setHours(8);
        vm.date.setMinutes(0);


        var idCurrent = authservice.currentUser().id;

        activate();

        if (!$rootScope.hasSubscribed){
            $sailsSocket.subscribe('appointment', function(appointment){
                if (appointment.verb == "destroyed"){
                    angular.forEach(vm.appointments, function(app,key){
                        if(app.id == appointment.id ){
                            vm.appointments.splice(key, 1);
                        }
                    })
                }
                if(appointment.previous){
                    if ( appointment.previous.doctor.id == authservice.currentUser().id ){
                        angular.forEach(vm.appointments, function(app,key){
                            if(app.id == appointment.id ){
                                if(appointment.data.state) app.state = appointment.data.state;
                            }
                        })
                    }
                }
            })
            $rootScope.hasSubscribed = true;
        }


        function activate() {
            var promises = [getPatients(), getAppointments(idCurrent)];
            return $q.all(promises).then(function() {
            });
        }

        function getPatients() {
            return dataservice.getPatientsList().success(function (data) {
                vm.patients = data;
                return vm.patients;
            });
        }

        function getAppointments(id) {
            return dataservice.getAppointmentsByDoctor(id).success(function (data) {
                vm.appointments = data;
                return vm.appointments;
            });
        }

        function getPatientById(id) {
            return dataservice.getPatientById(id)
                .success(function (data) {
                    return data.name;
                });
        }

        function onSelect(patient) {
            vm.patient = patient;
        }

        function cancelAppointment(id) {
            dataservice.cancelAppointment(id).success(function (data){
                angular.forEach(vm.appointments, function(app,key) {
                    if (app.id == data.id) {
                        if (data.state) app.state = data.state;
                    }
                })
            });
            logger.info('Le rendez-vous a été annulé !')
        }

        function deleteAppointment(id) {
            dataservice.deleteAppointment(id).success(function (data){
                angular.forEach(vm.appointments, function(app,key) {
                    if (app.id == data.id) {
                        vm.appointments.splice(key,1);
                    }
                })
            });
            logger.info('Le rendez-vous a été supprimé !')
        }

        function addAppointment(idPatient) {
            dataservice.addAppointment(idPatient,idCurrent,vm.dt).success(function(data) {
                vm.appointments.push(data[0]);
                vm.patient = null;
                vm.selected = '';
            });
            logger.info('Le rendez-vous a été ajouté !')
        }

        function broadcastAppointment(){
            console.log("BroadcastAppointment");
            console.log(vm.date);
            dataservice.broadcastAppointment(idCurrent,vm.date).success(function(data){
                console.log(data)
                logger.info("Le rendez-vous à été proposé ! ");

            })
        }

        //Datepicker

        function clear() {
            vm.dt = null;
        }
    }
})();
