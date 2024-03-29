(function () {
    'use strict';

    angular
        .module('app.account')
        .controller('AccountController', AccountController);

    AccountController.$inject = ['$stateParams', 'dataservice', 'logger', '$q', '$state', 'authservice', '$rootScope','subscribeservice', 'storageservice', 'ngDialog'];

    /* @ngInject */
    function AccountController($stateParams, dataservice, logger, $q, $state, authservice, $rootScope, subscribeservice, storageservice, ngDialog)
    {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.title = 'Account';
        vm.newPatient = {};
        vm.user = {};
        vm.credentials = {};
        vm.categories = [];
        vm.category = {};
        vm.addPatient = addPatient;
        vm.updateUser = updateUser;
        vm.sendResetPasswordLink = sendResetPasswordLink;
        vm.resetPassword = resetPassword;
        vm.addCategory = addCategory;
        vm.deleteCategory = deleteCategory;
        vm.login = login;

        activate();

        function activate() {
            if (authservice.isAuthenticated()) {
                var idCurrent = authservice.currentUser().id;
                var data = [];
                if (authservice.isDoctor()) {
                    vm.isDoctor = true;
                    if (!$rootScope.hasSubNotifDoctor){subscribeservice.notificationDoctor(idCurrent);}
                    data.push(getDoctor(idCurrent));
                    data.push(getCategories(idCurrent));
                }
                else if (authservice.isPatient()) {
                    vm.isPatient = true;
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
                    console.log(data);
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
            delete user.appointments;
            if (authservice.isPatient()) {
                return dataservice.updatePatient(id, user)
                    .success(function (data) {
                        data.dateOfBirth = new Date(data.dateOfBirth);
                        data.token = user.token;
                        data.role = 'patient';
                        storageservice.set('auth_token', JSON.stringify(data));
                        vm.user = data;
                        logger.info('Vos informations ont été modifiées !');
                        return vm.user;
                    });
            }
            else {
                return dataservice.updateDoctor(id, user)
                    .success(function (data) {
                        vm.user = data;
                        data.token = user.token;
                        data.role = 'doctor';
                        storageservice.set('auth_token', JSON.stringify(data));
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

        function sendResetPasswordLink() {
            return dataservice.forgotPassword(vm.emailForPasswordReset)
                .then(function(data) {
                    logger.success('Vous allez recevoir un mail avec un lien pour changer de mot de passe.');
                    $state.go('signin');
                    return data;
                });
        }

        function resetPassword() {
            var dataToSend = {
                token: $stateParams.token,
                password: vm.newPassword,
                confirmation: vm.newPasswordConfirmation
            };

            return dataservice.resetPassword(dataToSend)
                .then(function(data) {
                    logger.success('Votre mot de passe a bien été changer, veuillez vous connecter.');
                    $state.go('signin');
                    return data;
                });
        }

        function getCategories(idCurrent) {
          return dataservice.getCategoriesByDoctor(idCurrent)
            .success(function (data){
              vm.categories = data;
              return data;
          });
        }

        function addCategory(category) {
          var idCurrent = authservice.currentUser().id;
          return dataservice.addCategory(idCurrent, category)
            .success(function (data){
              vm.categories.push(data);
              logger.success('Le type de consultation à bien été ajouté !');
              vm.category = {}
              return data;
          });
        }

        function deleteCategory(id) {
          ngDialog.openConfirm({
            template: 'app/widgets/modalConfirm.html',
            className: 'ngdialog-theme-default',
            data: {message: 'Voulez-vous supprimer ce type de consultation ?'}
          }).then(function (value) {
            dataservice.deleteCategory(id).success(function(res) {
              angular.forEach(vm.categories, function(category,key){
                  if(category.id == id ){
                      vm.categories.splice(key, 1);
                  }
              })
              logger.info("Le type de consultation à bien été supprimé !");
            });
          }, function (reason) {
            console.log('Proposed Modal promise rejected. Reason: ', reason);
          });
        }
    }
})();
