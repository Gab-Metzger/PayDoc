/**
 * Simple storage service which uses browser localStorage service to store
 * application data. Main usage of this is to store user data and JWT token
 * to browser.
 *
 * But this can be also used to cache some data from backend to users browser
 * cache, just remember that local storage IS NOT intended to store "large"
 * amounts of data.
 */
(function() {
    'use strict';

    angular
        .module('app.core')
        .factory('storageservice', storageservice);

    function storageservice() {

        var service = {
            get: get,
            set: set,
            unset: unset
        }

        return service;

        function get(key) {
            return localStorage.getItem(key);
        }

        function set(key, value) {
            return localStorage.setItem(key, value);
        }

        function unset(key) {
            return localStorage.removeItem(key);
        }
    }
}());
