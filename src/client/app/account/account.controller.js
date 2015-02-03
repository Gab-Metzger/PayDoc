(function () {
    'use strict';

    angular
        .module('app.account')
        .controller('AccountController', AccountController);

    AccountController.$inject = ['dataservice', 'logger', '$q', '$state', 'authservice'];

    /* @ngInject */
    function AccountController(dataservice, logger, $q, $state, authservice)
    {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.title = 'Account';
        vm.newPatient = {};
        vm.patient = {};
        vm.credentials = {};
        vm.addPatient = addPatient;
        vm.updatePatient = updatePatient;
        vm.login = login;

        activate();

        ////////////////

        function activate() {
            if (authservice.isAuthenticated()) {
                var idCurrent = authservice.currentUser().id;
                var promises = [getPatient(idCurrent)];
                return $q.all(promises).then(function() {
                    logger.info('Activated Account View');
                });
            }
            else {
                logger.info('Activated Account View');
            }
        }

        function getPatient(id) {
            return dataservice.getPatientById(id)
                .then(function (data) {
                    vm.patient = data;
                    return vm.patient;
                });
        }

        function addPatient(patient) {
            return dataservice.addPatient(patient)
                .then(function (data) {
                    vm.newPatient = {};
                    $state.go('dashboard');
                    return data;
                });
        }

        function updatePatient(id, patient) {
            return dataservice.updatePatient(id, patient)
                .then(function (data) {
                    vm.patient = data;
                    return vm.patient;
                });
        }

        function login(credentials) {
            return authservice.login(credentials)
                .then(function(data) {
                    logger.success(data.firstName + ', vous êtes connecté');
                    $state.go('dashboard');
                    return data;
                });
        }
    }
})();
