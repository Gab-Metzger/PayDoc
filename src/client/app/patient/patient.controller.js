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
        vm.broadcastedAppointments =[];
        vm.cancelAppointment = cancelAppointment;
        vm.chooseAppointment = chooseAppointment;
        vm.validateAppointment = validateAppointment;



        var idCurrent = authservice.currentUser().id;

        $sailsSocket.subscribe('appointment',function(appointment){
            if (appointment.verb == "destroyed"){
                angular.forEach(vm.appointments, function(app,key){
                    if(app.id == appointment.id ){
                        vm.appointments.splice(key, 1);
                    }
                })
            }
            if(appointment.verb == "created"){
                if (appointment.data.patient == idCurrent) {
                    vm.appointments.push(appointment.data)
                }
            }

            // Si modification d'un RDV
            if (appointment.previous){
                if (appointment.previous.patient.id == idCurrent){
                    angular.forEach(vm.appointments, function(app,key) {
                        if (app.id == appointment.id) {
                            if (appointment.data.state) app.state = appointment.data.state;
                        }
                    })
                }
            }
        });

        activate();

        ////////////////


        function activate() {
            var promises = [getPatient(idCurrent), getAppointments(idCurrent), getBroadcasted(idCurrent)];
            return $q.all(promises).then(function() {
            });
        }

        function getBroadcasted(idCurrent){
            if (authservice.currentUser().receiveBroadcast) {
                return dataservice.getBroadcasted(idCurrent).success(function(data){
                    vm.broadcastedAppointments = data;
                    return vm.broadcastedAppointments;
                })
            }
            else {
                return;
            }
        }

        function getPatient(id) {
            return dataservice.getPatientById(id).success(function (data) {
                vm.patient = data;
                return vm.patient;
            });
        }

        function getAppointments(id) {
            return dataservice.getAppointmentsByPatient(id).success(function (data) {
                vm.appointments = data;
                return vm.appointments;
            });
        }

        function validateAppointment(appoint) {
            dataservice.validateAppointment(appoint.id).success(function (data){
                angular.forEach(vm.appointments, function(app,key) {
                    if (app.id == data.id) {
                        if (data.state) app.state = data.state;
                    }
                });
                dataservice.incrNbValidated(data.doctor);
            });
            logger.info('Le rendez-vous a été validé !')
        }

        function cancelAppointment(id) {
            dataservice.cancelAppointment(id).success(function (data){
                angular.forEach(vm.appointments, function(app,key) {
                    if (app.id == data.id) {
                        if (data.state) app.state = data.state;
                    }
                });
                dataservice.incrNbCancelled(data.doctor);
            });
            logger.info('Le rendez-vous a été annulé !')
        }

        function chooseAppointment(appoint) {
            dataservice.cancelFirstAppointment(appoint.start, idCurrent, appoint.doctor.id)
              .success(function(res) {
                angular.forEach(vm.appointments, function(app,key) {
                    if (app.id == res[0].id) {
                        vm.appointments.splice(key,1);
                    }
                })
                dataservice.chooseAppointment(appoint.id, idCurrent).success(function (data){
                    angular.forEach(vm.broadcastedAppointments, function(app,key) {
                        if (app.id == data[0].id) {
                            vm.broadcastedAppointments[key].state = 'approved';
                            vm.appointments.push(vm.broadcastedAppointments[key]);
                            vm.broadcastedAppointments.splice(key,1);
                        }
                    })
                });
              })
            logger.info('Le rendez-vous a été accepté !')
        }
    }
})();
