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

    function authservice($http, $state, storageservice, USER_ROLES, logger) {

        var service = {
            authorize: authorize,
            isAuthenticated: isAuthenticated,
            login: login,
            logout: logout,
            currentUser: currentUser,
            isPatient: isPatient,
            isDoctor: isDoctor
        }

        return service;

        function authorize(accessLevel) {
            if (accessLevel === USER_ROLES.patient) {
                return this.isAuthenticated() && (angular.fromJson(storageservice.get('auth_token')).role === USER_ROLES.patient);
            } else if (accessLevel === USER_ROLES.doctor) {
                return this.isAuthenticated() && (angular.fromJson(storageservice.get('auth_token')).role === USER_ROLES.doctor);
            }
            else if (accessLevel === USER_ROLES.all) {
                return true;
            }
        }

        function isAuthenticated() {
            return Boolean(storageservice.get('auth_token'));
        }

        function login(credentials) {
            return $http
                .post('http://localhost:1337/auth/create', credentials, {withCredentials: true})
                .then(function(response) {
                    storageservice.set('auth_token', JSON.stringify(response.data));
                    return response.data;
                });
        }

        function logout() {
            storageservice.unset('auth_token');
            logger.success('You have been logged out.');
            $state.go('signin');
        }

        function currentUser() {
            var current = storageservice.get('auth_token');
            return JSON.parse(current);
        }

        function isPatient() {
            return (angular.fromJson(storageservice.get('auth_token')).role === 'patient');
        }

        function isDoctor() {
            return (angular.fromJson(storageservice.get('auth_token')).role === 'doctor');
        }
    }
}());
