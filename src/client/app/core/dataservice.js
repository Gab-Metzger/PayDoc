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
            deleteAppointment: deleteAppointment,
            validateAppointment: validateAppointment,
            addAppointment: addAppointment,
            addPatient: addPatient,
            updatePatient: updatePatient,
            updateDoctor: updateDoctor,
            broadcastAppointment: broadcastAppointment,
            getBroadcasted: getBroadcasted,
            chooseAppointment: chooseAppointment
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
            return $sailsSocket.get(BackEndUrl+'appointment?where={"patient":'+id+'}&populate=doctor')
                .success(function(data){
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
            return $sailsSocket.put(BackEndUrl+'appointment/'+id, {
                state: 'denied'
            })
                .success(function(data){
                    return data;
                })
                .error(function(err){
                    console.log('Request Failed for cancelAppointment. ' + err)
                })
        }

        function deleteAppointment(id) {
            return $sailsSocket.delete(BackEndUrl+'appointment/'+id)
                .success(function(data){
                    return data;
                })
                .error(function(err){
                    console.log('Request Failed for deleteAppointment. ' + err)
                })
        }

        function validateAppointment(id) {
            return $sailsSocket.put(BackEndUrl+ 'appointment/' + id, {
                state: 'approved'
            })
                .success(function(data){
                    return data;
                })
                .error(function(err){
                    console.log('Request Failed for validateAppointement. ' + err)
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

        function getBroadcasted(idPatient){
            return $sailsSocket.post(BackEndUrl+'appointment/getBroadcasted',{
                patient: idPatient
            })
                .success(function(data){
                    console.log(data);
                    return data;
                })
                .error(function(err){
                    console.log('Request Failed for getBroadcasted. ' + err)
                })
        }

        function chooseAppointment(id, patientId) {
            return $sailsSocket.put(BackEndUrl+ 'appointment/' + id, {
                patient: patientId,
                state: 'approved'
            })
                .success(function(data){
                    return data;
                })
                .error(function(err){
                    console.log('Request Failed for chooseAppointment. ' + err)
                })
        }
    }
})();
