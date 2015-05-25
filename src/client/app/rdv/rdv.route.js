(function() {
    'use strict';

    angular
        .module('app.rdv')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
          {
              state: 'rdv',
              config: {
                  url: '/rdv',
                  templateUrl: 'app/rdv/rdv.html',
                  controller: 'RdvController',
                  controllerAs: 'vm',
                  title: 'Rendez-vous non confirmés',
                  settings: {
                      nav: 5,
                      content: '<i class="fa fa-exclamation-circle"></i> Rdv non-confirmés'
                  },
                  authorizedRoles: 'doctor'
              }
          }
        ];
    }
})();
