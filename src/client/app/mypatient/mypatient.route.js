(function() {
    'use strict';

    angular
        .module('app.admin')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'mypatient',
                config: {
                    url: '/mypatient',
                    templateUrl: 'app/mypatient/mypatient.html',
                    controller: 'MyPatientController',
                    controllerAs: 'vm',
                    title: 'Mes Patients',
                    settings: {
                        nav: 5,
                        content: '<i class="fa fa-users"></i> Mes patients'
                    },
                    authorizedRoles: 'doctor'
                }
            }
        ];
    }
})();
