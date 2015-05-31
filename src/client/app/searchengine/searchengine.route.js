(function() {
    'use strict';

    angular
        .module('app.searchengine')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
          {
              state: 'searchengine',
              config: {
                  url: '/search',
                  templateUrl: 'app/searchengine/searchengine.html',
                  controller: 'SearchEngineController',
                  controllerAs: 'vm',
                  title: 'Moteur de recherche',
                  settings: {
                      nav: 6,
                      content: '<i class="fa fa-search"></i> KalSearch'
                  },
                  authorizedRoles: 'doctor'
              }
          }
        ];
    }
})();
