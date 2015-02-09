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

        console.log('je subscribe au RDV')
        $sailsSocket.subscribe('appointment',function(appointment){
            console.log("Un nouveua rdv est crée ")
            console.log(appointment)
            if(appointment.data.patient == idCurrent){
                if (appointment.verb == "created"){
                    vm.appointments.push(appointment.data)
                }
            }
            // Si modification d'un RDV
            if (appointment.previous){
                if (appointment.previous.patient.id == idCurrent){
                    angular.forEach(vm.appointments, function(app,key) {
                        if (app.id == appointment.id) {
                            vm.appointments.splice(key,1);
                            //if (appointment.data.state) app.state = appointment.data.state;
                        }
                    })
                }
            }
        })

        activate();

        ////////////////

        function activate() {
            var promises = [getPatient(idCurrent), getAppointments(idCurrent)];
            return $q.all(promises).then(function() {
            });
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

        function validateAppointment(id) {
            dataservice.validateAppointment(id);
        }

        vm.open = function (id) {

            var modalInstance = $modal.open({
                templateUrl: 'app/widgets/modalContent.html',
                controller: ['$modalInstance', '$scope',
                    function($modalInstance, $scope) {

                        $scope.cardInfos = {};

                        $scope.ok = function () {
                            if ($scope.payForm.$valid) {
                                $modalInstance.close();
                            }
                            else {
                                $scope.errorMessage = 'Veuillez entrer toutes les informations.';
                            }

                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    }
                ]
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
