(function () {
    'use strict';

    var core = angular.module('app.core');

    core.config(toastrConfig);

    toastrConfig.$inject = ['toastr'];
    /* @ngInject */
    function toastrConfig(toastr) {
        toastr.options.timeOut = 3000;
        toastr.options.positionClass = 'toast-top-right';
        toastr.options.closeButton = true;
    }

    var config = {
        appErrorPrefix: '[PayDoc Error] ',
        appTitle: 'PayDoc'
    };

    core.value('config', config);

    redirectOnUserAgent()

    core.config(configure);

    configure.$inject = ['$logProvider', 'routerHelperProvider', 'exceptionHandlerProvider', '$httpProvider','$sailsSocketProvider'];
    /* @ngInject */
    function configure($logProvider, routerHelperProvider, exceptionHandlerProvider, $httpProvider,$sailsSocketProvider) {
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }
        exceptionHandlerProvider.configure(config.appErrorPrefix);
        routerHelperProvider.configure({docTitle: config.appTitle + ': '});
        $sailsSocketProvider.interceptors.push('AuthInterceptor');
        $httpProvider.interceptors.push('AuthInterceptor');

    }

    function redirectOnUserAgent() {
      var mapping = {
        // scheme : market://details?id=<package_name>
        'android': 'market://details?id=com.paydoc.paydoc',

        //scheme : itms-apps://itunes.apple.com/app/id<numeric_app_id>
        'iphone': 'itms-apps://itunes.apple.com/app/id987077385',

        // if availables :
        'ipad': 'itms-apps://itunes.apple.com/app/id987077385',
        'ipod':'itms-apps://itunes.apple.com/app/id987077385',
      }

      var userAgent = navigator.userAgent.toLowerCase();
      for (var dev in mapping) {
        if (userAgent.search(dev) != -1) {
            window.location = mapping[dev];
            return;
        }
      }
    }

})();
