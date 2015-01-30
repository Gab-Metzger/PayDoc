(function() {
    'use strict';

    angular
        .module('app.patient')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'patient',
                config: {
                    url: '/patient',
                    templateUrl: 'app/patient/patient.html',
                    controller: 'PatientController',
                    controllerAs: 'vm',
                    title: 'patient',
                    settings: {
                        nav: 2,
                        content: '<i class="fa fa-calendar"></i> Mes rendez-vous'
                    },
                    authorizedRoles: 'patient'
                }
            }
        ];
    }
})();
