(function() {
    'use strict';

    angular
        .module('app.account')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'signup',
                config: {
                    url: '/signup',
                    templateUrl: 'app/account/signup.html',
                    controller: 'AccountController',
                    controllerAs: 'vm',
                    title: 'Sign Up',
                    authorizedRoles: '*'
                }
            },
            {
                state: 'signin',
                config: {
                    url: '/signin',
                    templateUrl: 'app/account/signin.html',
                    controller: 'AccountController',
                    controllerAs: 'vm',
                    title: 'Sign In',
                    authorizedRoles: '*'
                }
            },
            {
                state: 'profile',
                config: {
                    url: '/profile',
                    templateUrl: 'app/account/profile.html',
                    controller: 'AccountController',
                    controllerAs: 'vm',
                    title: 'profile',
                    settings: {
                        nav: 3,
                        content: '<i class="fa fa-user"></i> Mon profil'
                    },
                    authorizedRoles: 'patient'
                }
            }
        ];
    }
})();
