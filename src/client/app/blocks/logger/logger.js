(function() {
    'use strict';

    angular
        .module('blocks.logger')
        .factory('logger', logger);

    logger.$inject = ['$log', 'toastr'];

    /* @ngInject */
    function logger($log, toastr) {
        var showToasts = true;

        if (Notification.permission !== 'denied') {
            Notification.requestPermission(function (permission) {
                if (!('permission' in Notification)) {
                    Notification.permission = permission;
                    showToasts = false;
                }
            });
        }
        var service = {
            showToasts: showToasts,

            error   : error,
            info    : info,
            success : success,
            warning : warning,

            // straight to console; bypass toastr
            log     : $log.log
        };

        return service;
        /////////////////////

        function error(message, data, title) {
            if (showToasts) toastr.error(message, title);
            $log.error('Error: ' + message, data);
            var notification = new Notification(title || 'PayDoc', {body: message});
        }

        function info(message, data, title) {
            if (showToasts) toastr.info(message, title);
            $log.info('Info: ' + message, data);
            var notification = new Notification(title || 'PayDoc', {body: message});
        }

        function success(message, data, title) {
            if (showToasts) toastr.success(message, title);
            $log.info('Success: ' + message, data);
            var notification = new Notification(title || 'PayDoc', {body: message});
        }

        function warning(message, data, title) {
            if (showToasts) toastr.warning(message, title);
            $log.warn('Warning: ' + message, data);
            var notification = new Notification(title || 'PayDoc', {body: message});
        }
    }
}());
