(function () {
    'use strict';

    angular
        .module('app.dashboard')
        .controller('DashboardController', DashboardController);

    DashboardController.$inject = ['$q', 'dataservice', 'logger'];
    /* @ngInject */
    function DashboardController($q, dataservice, logger) {
        /* jshint validthis: true */
        var vm = this;
        vm.news = {
            title: 'angularPapa',
            description: 'Hot Towel Angular is a SPA template for Angular developers.'
        };
        vm.messageCount = 0;
        vm.doctors = [];
        vm.title = 'Dashboard';

        activate();

        function activate() {
            var promises = [getDoctors()];
            return $q.all(promises).then(function() {
            });
        }

        function getDoctors() {
            return dataservice.getDoctorsList().success(function (data) {
                vm.doctors = data;
                return vm.doctors;
            });
        }
    }
})();
