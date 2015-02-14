(function () {
    'use strict';

    angular
        .module('app.account')
        .controller('AccountController', AccountController);

    AccountController.$inject = ['dataservice', 'logger', '$q', '$state', 'authservice', '$sailsSocket', '$rootScope','subscribeservice'];

    /* @ngInject */
    function AccountController(dataservice, logger, $q, $state, authservice, $sailsSocket, $rootScope,subscribeservice)
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
                    if (!$rootScope.hasSubNotifDoctor){subscribeservice.notificationDoctor(idCurrent);}
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
                .success(function (data) {
                    vm.user = data;
                    return vm.user;
                });
        }

        function getPatient(id) {
            return dataservice.getPatientById(id)
                .success(function (data) {
                    vm.user = data;
                    return vm.user;
                });
        }

        function addPatient(patient) {
            return dataservice.addPatient(patient)
                .success(function (data) {
                    vm.newPatient = {};
                    if (authservice.isDoctor()) {
                        $state.go('admin');
                        logger.info('Le compte patient a été crée !');
                    }
                    else {
                        $state.go('signin');
                        logger.success('Veuillez vérifier vos mails pour finaliser l\'inscription !');
                    }
                    return data;
                });
        }

        function updateUser(id, user) {
            if (authservice.isPatient()) {
                return dataservice.updatePatient(id, user)
                    .success(function (data) {
                        vm.user = data;
                        logger.info('Vos informations ont été modifiées !');
                        return vm.user;
                    });
            }
            else {
                return dataservice.updateDoctor(id, user)
                    .success(function (data) {
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
                    $rootScope.isAuthenticated = authservice.isAuthenticated();
                    $rootScope.$broadcast('syncSideBar', []);
                    $rootScope.hasSubscribed = false;
                    return data;
                });
        }
    }
})();
