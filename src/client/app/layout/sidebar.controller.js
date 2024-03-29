(function() {
    'use strict';

    angular
        .module('app.layout')
        .controller('SidebarController', SidebarController);

    SidebarController.$inject = ['$state', 'routerHelper', 'authservice', 'logger', '$scope'];
    /* @ngInject */
    function SidebarController($state, routerHelper, authservice, logger, $scope) {
        /* jshint validthis: true */
        var vm = this;
        var states = routerHelper.getStates();
        vm.isCurrent = isCurrent;
        vm.logout = logout;

        activate();

        $scope.$on('syncSideBar', function() {
            activate();
            vm.currentName = authservice.currentUser().name;
        })

        function activate() {
            vm.isAuthenticated = authservice.isAuthenticated();
            getNavRoutes();

        }

        function getNavRoutes() {
            if (authservice.authorize('patient')) {
                vm.navRoutes = states.filter(function(r) {
                    if (!angular.isArray(r.authorizedRoles)) {
                        r.authorizedRoles = [r.authorizedRoles];
                    }
                    return r.settings && r.settings.nav && ((r.authorizedRoles.indexOf('patient') !== -1) || (r.authorizedRoles.indexOf('*') !== -1));
                }).sort(function(r1, r2) {
                    return r1.settings.nav - r2.settings.nav;
                });
            }
            else if (authservice.authorize('doctor')) {
                vm.navRoutes = states.filter(function(r) {
                    if (!angular.isArray(r.authorizedRoles)) {
                        r.authorizedRoles = [r.authorizedRoles];
                    }
                    return r.settings && r.settings.nav && (r.authorizedRoles.indexOf('doctor') !== -1);
                }).sort(function(r1, r2) {
                    return r1.settings.nav - r2.settings.nav;
                });
            }
            else {
                vm.navRoutes = states.filter(function(r) {
                    if (!angular.isArray(r.authorizedRoles)) {
                        r.authorizedRoles = [r.authorizedRoles];
                    }
                    return r.settings && r.settings.nav && (r.authorizedRoles.indexOf('*') !== -1);
                }).sort(function(r1, r2) {
                    return r1.settings.nav - r2.settings.nav;
                });
            }

        }

        function isCurrent(route) {
            if (!route.title || !$state.current || !$state.current.title) {
                return '';
            }
            var menuName = route.title;
            return $state.current.title.substr(0, menuName.length) === menuName ? 'current' : '';
        }

        function logout() {
            authservice.logout();
            activate();
            logger.success('Vous êtes déconnecté !');
        }
    }
})();
