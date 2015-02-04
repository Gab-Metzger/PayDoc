(function() {
    'use strict';

    angular
        .module('app.layout')
        .controller('SidebarController', SidebarController);

    SidebarController.$inject = ['$state', 'routerHelper', 'authservice', 'logger'];
    /* @ngInject */
    function SidebarController($state, routerHelper, authservice, logger) {
        /* jshint validthis: true */
        var vm = this;
        var states = routerHelper.getStates();
        vm.isCurrent = isCurrent;
        vm.isAuthenticated = authservice.isAuthenticated();
        vm.logout = logout;

        activate();

        function activate() { getNavRoutes(); }

        function getNavRoutes() {
            if (authservice.authorize('patient')) {
                vm.navRoutes = states.filter(function(r) {
                    return r.settings && r.settings.nav && ((r.authorizedRoles === 'patient') || (r.authorizedRoles === '*'));
                }).sort(function(r1, r2) {
                    return r1.settings.nav - r2.settings.nav;
                });
            }
            else if (authservice.authorize('doctor')) {
                vm.navRoutes = states.filter(function(r) {
                    return r.settings && r.settings.nav && (r.authorizedRoles === 'doctor');
                }).sort(function(r1, r2) {
                    return r1.settings.nav - r2.settings.nav;
                });
            }
            else {
                vm.navRoutes = states.filter(function(r) {
                    return r.settings && r.settings.nav && (r.authorizedRoles === '*');
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
            logger.success('Vous êtes déconnecté !');
        }
    }
})();
