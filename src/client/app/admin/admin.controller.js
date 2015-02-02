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
        vm.opened = false;
        vm.minDate = new Date();
        vm.format = 'dd/MM/yyyy';
        vm.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };
        vm.open = open;
        vm.clear = clear;

        //TimePicker
        vm.time = new Date();
        vm.time.setHours(14);
        vm.time.setMinutes(0);
        vm.update = update;

        var idCurrent = authservice.currentUser().id;

        activate();

        function activate() {
            var promises = [getPatients(), getAppointments(idCurrent)];
            return $q.all(promises).then(function() {
                logger.info('Activated Patient View');
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
            vm.appointments.splice(id,1);
        };

        function addAppointment(idPatient) {
            var startDate = new Date(vm.dt.toDateString() + " " + vm.time.toLocaleTimeString());
            dataservice.addAppointment(idPatient,idCurrent,startDate).then(function(data) {
                logger.info('Le rendez-vous à été ajouté !')
                vm.appointments.push(data);
            })
        }

        //Datepicker

        function open($event) {
            $event.preventDefault();
            $event.stopPropagation();

            vm.opened = true;
        };

        function clear() {
            vm.dt = null;
        };

        //Timepicker

        function update() {
            var d = new Date();
            d.setHours( 14 );
            d.setMinutes( 0 );
            vm.mytime = d;
        };
    }
})();
