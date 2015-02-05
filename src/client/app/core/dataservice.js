(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('dataservice', dataservice);

    dataservice.$inject = ['$http', 'BackEndUrl'];
    /* @ngInject */
    function dataservice($http, BackEndUrl) {
        var service = {
            getDoctorsList: getDoctorsList,
            getPatientsList: getPatientsList,
            getDoctorById: getDoctorById,
            getPatientById: getPatientById,
            getAppointmentsByPatient: getAppointmentsByPatient,
            getPatientsByDoctor: getPatientsByDoctor,
            getAppointmentsByDoctor: getAppointmentsByDoctor,
            cancelAppointment: cancelAppointment,
            validateAppointment: validateAppointment,
            addAppointment: addAppointment,
            addPatient: addPatient,
            updatePatient: updatePatient,
            updateDoctor: updateDoctor
        };

        return service;


        function getDoctorsList() {
            return $http.get(BackEndUrl+'doctor')
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
            return $http.get(BackEndUrl+'patient')
                .then(getPatientsListComplete)
                .catch(getPatientsListFailed);

            function getPatientsListComplete(response) {
                return response.data;
            }

            function getPatientsListFailed(error) {
                console.log('XHR Failed for getPatientsList.' + error.data);
            }
        }

        function getDoctorById(id) {
            return $http.get(BackEndUrl+'doctor/'+id+'?populate=appointments')
                .then(getDoctorByIdComplete)
                .catch(getDoctorByIdFailed);

            function getDoctorByIdComplete(response) {
                return response.data;
            }

            function getDoctorByIdFailed(error) {
                console.log('XHR Failed for getDoctorById.' + error.data);
            }
        }

        function getPatientById(id) {
            return $http.get(BackEndUrl+'patient/'+id+'?populate=appointments')
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
            return $http.get(BackEndUrl+'appointment?where={"patient":'+id+', "cancelled": "false"}&populate=doctor')
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
            return $http.get(BackEndUrl+'doctor')
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
            return $http.get(BackEndUrl+'appointment?where={"doctor":'+id+', "startDate": {">": '+ new Date()+'}}&populate=patient')
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
            return $http.put(BackEndUrl+'appointment/'+id, {cancelled: true});

        }

        function validateAppointment(id) {
            return $http.put(BackEndUrl+'appointment/'+id, {validated: true});

        }

        function addAppointment(idPatient, idDoctor, startDate) {
            return $http.post(BackEndUrl+'appointment', {patient: idPatient, doctor: idDoctor, startDate: startDate})
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
            return $http.post(BackEndUrl+'patient', patient)
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
            return $http.put(BackEndUrl+'patient/'+id, patient)
                .then(updatePatientComplete)
                .catch(updatePatientFailed);

            function updatePatientComplete(response) {
                return response.data;
            }

            function updatePatientFailed(error) {
                console.log('XHR Failed for updatePatient.' + error.data);
            }
        }

        function updateDoctor(id, doctor) {
            return $http.put(BackEndUrl+'doctor/'+id, doctor)
                .then(updateDoctorComplete)
                .catch(updateDoctorFailed);

            function updateDoctorComplete(response) {
                return response.data;
            }

            function updateDoctorFailed(error) {
                console.log('XHR Failed for updateDoctor.' + error.data);
            }
        }
    }
})();
