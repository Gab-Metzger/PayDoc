(function () {
    'use strict';

    angular
        .module('app.admin')
        .controller('AdminController', AdminController);

    AdminController.$inject = ['logger', 'dataservice', '$q', 'authservice'];
    /* @ngInject */
    function AdminController(logger, dataservice, $q, authservice) {
        var vm = this;
        vm.title = 'Admin';
        vm.patients = [];
        vm.onSelect = onSelect;
        vm.appointments = [];
        vm.getPatientById = getPatientById;
        vm.cancelAppointment = cancelAppointment;
        vm.addAppointment = addAppointment;

        //DatePicker
        vm.dt = null;
        vm.minDate = new Date();
        vm.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };
        vm.clear = clear;


        var idCurrent = authservice.currentUser().id;

        activate();

        function activate() {
            var promises = [getPatients(), getAppointments(idCurrent)];
            return $q.all(promises).then(function() {
            });
        }

        function getPatients() {
            return dataservice.getPatientsList().then(function (data) {
                vm.patients = data;
                return vm.patients;
            });
        }

        function getAppointments(id) {
            return dataservice.getAppointmentsByDoctor(id).then(function (data) {
                vm.appointments = data;
                return vm.appointments;
            });
        }

        function getPatientById(id) {
            return dataservice.getPatientById(id)
                .then(function (data) {
                    return data.name;
                });
        }

        function onSelect(patient) {
            vm.patient = patient;
        }

        function cancelAppointment(id) {
            dataservice.cancelAppointment(id);
            logger.info('Le rendez-vous a été annulé !')
        }

        function addAppointment(idPatient) {
            dataservice.addAppointment(idPatient,idCurrent,vm.dt).then(function(data) {
                logger.info('Le rendez-vous à été ajouté !');
                vm.appointments.push(data);
            })
        }

        //Datepicker

        function clear() {
            vm.dt = null;
        }
    }
})();
