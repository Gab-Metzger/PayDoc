(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('dataservice', dataservice);

    dataservice.$inject = ['$http'];
    /* @ngInject */
    function dataservice($http) {
        var service = {
            getDoctorsList: getDoctorsList,
            getPatientsList: getPatientsList,
            getPatientById: getPatientById,
            getAppointmentsByPatient: getAppointmentsByPatient,
            getPatientsByDoctor: getPatientsByDoctor,
            getAppointmentsByDoctor: getAppointmentsByDoctor,
            cancelAppointment: cancelAppointment,
            validateAppointment: validateAppointment,
            addAppointment: addAppointment,
            addPatient: addPatient,
            updatePatient: updatePatient
        };

        return service;


        function getDoctorsList() {
            return $http.get('http://localhost:1337/doctor')
                .then(getDoctorsComplete)
                .catch(getDoctorsFailed);

            function getDoctorsComplete(response) {
                return response.data;
            }

            function getDoctorsFailed(error) {
                console.log('XHR Failed for getDoctors.' + error.data);
            }
        }

        function getPatientsList() {
            return $http.get('http://localhost:1337/patient')
                .then(getPatientsListComplete)
                .catch(getPatientsListFailed);

            function getPatientsListComplete(response) {
                return response.data;
            }

            function getPatientsListFailed(error) {
                console.log('XHR Failed for getPatientsList.' + error.data);
            }
        }

        function getPatientById(id) {
            return $http.get('http://localhost:1337/patient/'+id+'?populate=appointments')
                .then(getPatientByIdComplete)
                .catch(getPatientByIdFailed);

            function getPatientByIdComplete(response) {
                return response.data;
            }

            function getPatientByIdFailed(error) {
                console.log('XHR Failed for getPatientById.' + error.data);
            }
        }

        function getAppointmentsByPatient(id)
        {
            return $http.get('http://localhost:1337/appointment?where={"patient":'+id+'}&populate=doctor')
                .then(getAppointmentsByPatientComplete)
                .catch(getAppointmentsByPatientFailed);

            function getAppointmentsByPatientComplete(response) {
                return response.data;
            }

            function getAppointmentsByPatientFailed(error) {
                console.log('XHR Failed for getAppointmentsByPatient.' + error.data);
            }
        }

        function getPatientsByDoctor(id) {
            return $http.get('http://localhost:1337/doctor')
                .then(getPatientsByDoctorComplete)
                .catch(getPatientsByDoctorFailed);

            function getPatientsByDoctorComplete(response) {
                return response.data[id].patients;
            }

            function getPatientsByDoctorFailed(error) {
                console.log('XHR Failed for getPatientsByDoctor.' + error.data);
            }
        }

        function getAppointmentsByDoctor(id)
        {
            return $http.get('http://localhost:1337/appointment?where={"doctor":'+id+', "cancelled": false}&populate=patient')
                .then(getAppointmentsByDoctorComplete)
                .catch(getAppointmentsByDoctorFailed);

            function getAppointmentsByDoctorComplete(response) {
                return response.data;
            }

            function getAppointmentsByDoctorFailed(error) {
                console.log('XHR Failed for getAppointmentsByDoctor.' + error.data);
            }
        }

        function cancelAppointment(id) {
            return $http.put('http://localhost:1337/appointment/'+id, {cancelled: true});

        }

        function validateAppointment(id) {
            return $http.put('http://localhost:1337/appointment/'+id, {validated: true});

        }

        function addAppointment(idPatient, idDoctor, startDate) {
            return $http.post('http://localhost:1337/appointment', {patient: idPatient, doctor: idDoctor, startDate: startDate})
                .then(addAppointmentComplete)
                .catch(addAppointmentFailed);

            function addAppointmentComplete(response) {
                return response.data;
            }

            function addAppointmentFailed(error) {
                console.log('XHR Failed for addAppointment.' + error.data);
            }
        }

        function addPatient(patient) {
            return $http.post('http://localhost:1337/patient', patient)
                .then(addPatientComplete)
                .catch(addPatientFailed);

            function addPatientComplete(response) {
                return response.data;
            }

            function addPatientFailed(error) {
                console.log('XHR Failed for addPatient.' + error.data);
            }
        }

        function updatePatient(id, patient) {
            return $http.put('http://localhost:1337/patient/'+id, patient)
                .then(updatePatientComplete)
                .catch(updatePatientFailed);

            function updatePatientComplete(response) {
                return response.data;
            }

            function updatePatientFailed(error) {
                console.log('XHR Failed for updatePatient.' + error.data);
            }
        }
    }
})();
