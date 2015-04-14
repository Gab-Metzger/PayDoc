/**
 * Auth service which is used to authenticate users with backend server and provide simple
 * methods to check if user is authenticated or not.
 *
 * Within successfully login process service will store user data and JWT token to local
 * storage where those are accessible in the application.
 *
 * This service provides following methods:
 *
 *  Auth.authorize(access)
 *  Auth.isAuthenticated()
 *  Auth.login(credentials)
 *  Auth.logout()
 *
 * You can use this service fairly easy on your controllers and views if you like to. It's
 * recommend that you use this service with 'CurrentUser' service in your controllers and
 * views.
 *
 * Usage example in controller:
 *
 *  angular
 *      .module('app')
 *      .controller('SomeController',
 *          [
 *              '$scope', 'Auth', 'CurrentUser',
 *              function ($scope, Auth, CurrentUser) {
 *                  $scope.auth = Auth;
 *                  $scope.user = CurrentUser.user;
 *              }
 *          ]
 *      );
 *
 * Usage example in view:
 *
 *  <div data-ng-show="auth.isAuthenticated()">
 *      Hello, <strong>{{user().email}}</strong>
 *  </div>
 *
 * Happy coding!
 *
 * @todo    Revoke method?
 * @todo    Text localizations?
 */
(function() {
    'use strict';

    angular
        .module('app.core')
        .factory('authservice', authservice);

    authservice.$inject = ['$http', '$state', 'storageservice', 'USER_ROLES', 'logger'];

    function authservice($http, $state, storageservice, logger) {

        return {
            authorize: authorize,
            isAuthenticated: isAuthenticated,
            login: login,
            logout: logout,
            currentUser: currentUser,
            isPatient: isPatient,
            isDoctor: isDoctor
        };

        function authorize(authorizedRoles) {

            if (this.isAuthenticated()) {
                var role = angular.fromJson(storageservice.get('auth_token')).role;
                if (!angular.isArray(authorizedRoles)) {
                    authorizedRoles = [authorizedRoles];
                }
                return (authorizedRoles.indexOf(role) !== -1) || (authorizedRoles.indexOf('*') !== -1);
            }
            else {
                return (authorizedRoles.indexOf('*') !== -1);
            }
        }

        function isAuthenticated() {
            return Boolean(storageservice.get('auth_token'));
        }

        function login(credentials) {
            return $http
                .post('https://paydoc-api.scalingo.io/auth/create', credentials, {withCredentials: true})
                .then(function(response) {
                    console.log(response);
                    if (response.data.message) {
                        logger.error(response.data.message);
                        $state.go('signin');
                        return response.data.message;
                    }
                    else {
                        storageservice.set('auth_token', JSON.stringify(response.data));
                        if (response.data.role === 'doctor') {
                            $state.go('admin');
                        }
                        else {
                            $state.go('patient');
                        }

                        return response.data;
                    }
                });
        }

        function logout() {
            storageservice.unset('auth_token');
            $state.go('signin');
        }

        function currentUser() {
            var current = storageservice.get('auth_token');
            return JSON.parse(current);
        }

        function isPatient() {
            return this.authorize('patient');
        }

        function isDoctor() {
            return this.authorize('doctor');
        }
    }
}());
