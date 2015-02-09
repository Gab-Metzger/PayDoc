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
        vm.addAppointment = addAppointment;
        vm.broadcastAppointment = broadcastAppointment;

        //DatePicker
        vm.dt = null;
        vm.minDate = new Date();
        vm.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };
        vm.clear = clear;
        vm.date = null;


        var idCurrent = authservice.currentUser().id;

        activate();

        if (!$rootScope.hasSubscribed){
            $sailsSocket.subscribe('appointment', function(appointment){
                console.log(appointment)
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
            dataservice.cancelAppointment(id);
            logger.info('Le rendez-vous a été annulé !')
        }

        function addAppointment(idPatient) {
            dataservice.addAppointment(idPatient,idCurrent,vm.dt).success(function(data) {
                console.log(data);
                logger.info('Le rendez-vous à été ajouté !');
                vm.appointments.push(data[0]);
            })
        }

        function broadcastAppointment(){
            console.log("BroadcastAppointment");
            console.log(vm.date);
            dataservice.broadcastAppointment(idCurrent,vm.date).success(function(data){
                console.log(data)
                logger.info("Le rendez-vous à été diffusé ! ");

            })
        }

        //Datepicker

        function clear() {
            vm.dt = null;
        }
    }
})();
