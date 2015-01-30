(function () {
    'use strict';

    angular
        .module('app.patient')
        .controller('PatientController', PatientController);

    PatientController.$inject = ['$q', 'dataservice', 'logger', '$modal', 'authservice'];

    /* @ngInject */
    function PatientController($q, dataservice, logger, $modal, authservice)
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

        function activate() {
            var promises = [getPatient(idCurrent), getAppointments(idCurrent)];
            return $q.all(promises).then(function() {
                logger.info('Activated Patient View');
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

        vm.open = function (size) {

            var modalInstance = $modal.open({
                templateUrl: 'app/widgets/modalContent.html',
                size: size,
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

                logger.info('Votre rendez-vous à bien été validé !');
            }, function () {
                logger.error('Veuillez entrer vos informations bancaires');
            });
        };
    }
})();
