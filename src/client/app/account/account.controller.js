(function () {
    'use strict';

    angular
        .module('app.account')
        .controller('AccountController', AccountController);

    AccountController.$inject = ['dataservice', 'logger', '$q', '$state', 'authservice', '$sailsSocket'];

    /* @ngInject */
    function AccountController(dataservice, logger, $q, $state, authservice,$sailsSocket)
    {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.title = 'Account';
        vm.newPatient = {};
        vm.user = {};
        vm.credentials = {};
        vm.addPatient = addPatient;
        vm.updateUser = updateUser;
        vm.login = login;

        activate();

        ////////////////
        console.log("Bonjour!")
        //$sailsSocket.get('http://localhost:1337/patient').success(function(doctor){
        //    console.log(doctor)
        //}).error(function(error){
        //    console.log(error)
        //})
        function activate() {
            if (authservice.isAuthenticated()) {
                var idCurrent = authservice.currentUser().id;
                var data = [];
                if (authservice.isDoctor()) {
                    data.push(getDoctor(idCurrent));
                }
                else if (authservice.isPatient()) {
                    data.push(getPatient(idCurrent))
                }
                var promises = data;
                return $q.all(promises).then(function() {
                });
            }
        }

        function getDoctor(id) {
            return dataservice.getDoctorById(id)
                .then(function (data) {
                    vm.user = data;
                    return vm.user;
                });
        }

        function getPatient(id) {
            return dataservice.getPatientById(id)
                .then(function (data) {
                    vm.user = data;
                    return vm.user;
                });
        }

        function addPatient(patient) {
            return dataservice.addPatient(patient)
                .then(function (data) {
                    vm.newPatient = {};
                    $state.go('signin');
                    return data;
                });
        }

        function updateUser(id, user) {
            if (authservice.isPatient()) {
                return dataservice.updatePatient(id, user)
                    .then(function (data) {
                        vm.user = data;
                        logger.info('Vos informations ont été modifiées !');
                        return vm.user;
                    });
            }
            else {
                return dataservice.updateDoctor(id, user)
                    .then(function (data) {
                        vm.user = data;
                        logger.info('Vos informations ont été modifiées !');
                        return vm.user;
                    });
            }
        }

        function login(credentials) {
            return authservice.login(credentials)
                .then(function(data) {
                    logger.success(data.firstName + ', vous êtes connecté');
                    return data;
                });
        }
    }
})();
