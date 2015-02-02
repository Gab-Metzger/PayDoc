(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('AuthInterceptor', AuthInterceptor);

    /* @ngInject */
    function AuthInterceptor($q, $injector) {
        return {
            request: function(config) {
                var LocalService = $injector.get('storageservice');
                var token;
                if (LocalService.get('auth_token')) {
                    token = angular.fromJson(LocalService.get('auth_token')).token;
                }
                if (token) {
                    config.headers.Authorization = 'Bearer ' + token;
                }
                return config;
            },
            responseError: function(response) {
                var LocalService = $injector.get('storageservice');
                if (response.status === 401 || response.status === 403) {
                    LocalService.unset('auth_token');
                    $injector.get('$state').go('signin');
                }
                return $q.reject(response);
            }
        };
    }
})
();
