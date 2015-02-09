(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('dataservice', dataservice);

    dataservice.$inject = ['$http', 'BackEndUrl', '$sailsSocket'];
    /* @ngInject */
    function dataservice($http, BackEndUrl, $sailsSocket) {
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
            updateDoctor: updateDoctor,
            broadcastAppointment: broadcastAppointment
        };

        return service;


        function getDoctorsList() {
            return $sailsSocket.get(BackEndUrl+'doctor')
                .success(function(doctor){
                    return doctor;
                })
                .error(function(error){
                    console.log('Request Failed for getDoctors. ' + error);
                })
        }

        function getPatientsList() {
            return $sailsSocket.get(BackEndUrl+'patient')
                .success(function(data){
                    return data;
                })
                .error(function(err){
                    console.log('Request Failed for getPatientsList. ' + err);
                })
        }

        function getDoctorById(id) {
            return $sailsSocket.get(BackEndUrl+'doctor/'+id+'?populate=appointments')
                .success(function(data){
                    return data;
                })
                .error(function(err){
                    console.log('Request Failed for getDoctorById. ' + err);
                })
        }

        function getPatientById(id) {

            return $sailsSocket.get(BackEndUrl+'patient/'+id+'?populate=appointments')
                .success(function(data){
                    return data;
                })
                .error(function(data){
                    console.log('Request Failed for getPatientByid. ' + err);
                })

        }

        function getAppointmentsByPatient(id)
        {
            return $sailsSocket.get(BackEndUrl+'appointment?where={"patient":'+id+',"state":["pending","approved"]}&populate=doctor')
                .success(function(data){
                    console.log(data)
                    return data;
                })
                .error(function(err){
                    console.log( err);
                })
        }

        function getPatientsByDoctor(id) {

            return $sailsSocket.get(BackEndUrl+'doctor')
                .success(function(data){
                    return data[id].patients;
                })
                .error(function(err){
                    console.log('Request Failed for getPatientsByDoctor. ' + err);
                })
        }

        function getAppointmentsByDoctor(id)
        {

            return $sailsSocket.get(BackEndUrl+'appointment?where={"doctor":'+id+'}&populate=patient')
                .success(function(data){
                    return data;
                })
                .error(function(err){
                    console.log('Request Failed for getAppointmentsByDoctor. ' + err );
                })
        }

        function cancelAppointment(id) {
            //return $http.put(BackEndUrl+'appointment/'+id, {cancelled: true});
            return $sailsSocket.put(BackEndUrl+'appointment/'+id, {
                state: 'denied'
            })
        }

        function validateAppointment(id) {
            //return $http.put(BackEndUrl+'appointment/'+id, {validated: true});
            return $sailsSocket.put(BackEndUrl+ 'appointment/' + id, {
                state: 'approved'
            })

        }

        function addAppointment(idPatient, idDoctor, startDate) {
            return $sailsSocket.post(BackEndUrl+'appointment/',{
                patient: idPatient,
                doctor: idDoctor,
                startDate: startDate
            })
                .success(function(data){
                    return data;
                })
                .error(function(err){
                    console.log('Request Failed for addAppointement. ' + err)
                })
        }

        function addPatient(patient) {
            return $sailsSocket.post(BackEndUrl+'patient', patient)
                .success(function(data){
                    return data;
                })
                .error(function(err){
                    console.log('Request Failed for addPatient. ' + err);
                })
        }

        function updatePatient(id, patient) {
            return $sailsSocket.put(BackEndUrl+'patient/'+id, patient)
                .success(function(data){
                    return data;
                })
                .error(function(err){
                    console.log('Request Failed for updatePatient. '+ err);
                })
        }

        function updateDoctor(id, doctor) {
            //return $http.put(BackEndUrl+'doctor/'+id, doctor)
            //    .then(updateDoctorComplete)
            //    .catch(updateDoctorFailed);
            //
            //function updateDoctorComplete(response) {
            //    return response.data;
            //}
            //
            //function updateDoctorFailed(error) {
            //    console.log('XHR Failed for updateDoctor.' + error.data);
            //}
            return $sailsSocket.put(BackEndUrl+'doctor/' +id, doctor)
                .success(function(data){
                    return data;
                })
                .error(function(err){
                    console.log(err);
                })
        }

        function broadcastAppointment(idDoctor, startDate){
            return $sailsSocket.post(BackEndUrl+'appointment/broadcast',{
                doctor: idDoctor,
                startDate: startDate
            })
                .success(function(data){
                    return data;
                })
                .error(function(err){
                    console.log('Request Failed for addAppointement. ' + err)
                })
        }
    }
})();
