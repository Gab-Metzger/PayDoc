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
            getDoctorById: getDoctorById,
            updateDoctor: updateDoctor,
            incrNbValidated: incrNbValidated,
            incrNbGiven: incrNbGiven,
            incrNbCancelled: incrNbCancelled,

            getPatientsList: getPatientsList,
            getPatientById: getPatientById,
            loadPatientAsync: loadPatientAsync,
            addPatient: addPatient,
            updatePatient: updatePatient,
            getPatientsByDoctor: getPatientsByDoctor,
            forgotPassword: forgotPassword,
            resetPassword: resetPassword,

            getAppointmentsByPatient: getAppointmentsByPatient,
            getAppointmentsByDoctor: getAppointmentsByDoctor,
            getAppointmentsByPatientAndDoctor: getAppointmentsByPatientAndDoctor,
            getPendingAppointmentsByDoctor: getPendingAppointmentsByDoctor,
            addAppointment: addAppointment,
            validateAppointment: validateAppointment,
            cancelAppointment: cancelAppointment,
            cancelMailAppointment: cancelMailAppointment,
            deleteAppointment: deleteAppointment,
            chooseAppointment: chooseAppointment,
            cancelFirstAppointment: cancelFirstAppointment,
            broadcastAppointment: broadcastAppointment,
            getBroadcasted: getBroadcasted,
            getBroadcastedHistory: getBroadcastedHistory,
            subscribeAppointment: subscribeAppointment,
            mailCancelled: mailCancelled,
            getAppointmentByDoctorAndDate : getAppointmentsByDoctorAndDate,
            appointmentHappened: appointmentHappened,
            moveAppointment: moveAppointment,
            extendAppointment: extendAppointment,
            editNote: editNote,
            remindAppointment: remindAppointment,

            getCategoriesByDoctor: getCategoriesByDoctor,
            addCategory: addCategory,
            deleteCategory: deleteCategory,

            getAvailableAppointments : getAvailableAppointments
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

        function loadPatientAsync(val) {
          var url = BackEndUrl+'patient/search';
          return $http.get(url, {
            params: {
              val: val,
            }
          }).then(function(response) {
           return response.data;
         });
        }

        function getPatientById(id) {

            return $sailsSocket.get(BackEndUrl+'patient/'+id+'?populate=appointments')
                .success(function(data){
                    data.dateOfBirth = new Date(data.dateOfBirth);
                    return data;
                })
                .error(function(err){
                    console.log('Request Failed for getPatientByid. ' + err);
                })

        }

        function getAppointmentsByPatient(id)
        {
            return $sailsSocket.get(BackEndUrl+'appointment?where={"patient":'+id+', "start": {">": "'+new Date().toISOString()+'"}}&sort=start&populate=doctor')
                .success(function(data){
                    return data;
                })
                .error(function(err){
                    console.log( err);
                })
        }

        function getAppointmentsByPatientAndDoctor(idPatient, idDoctor)
        {
            return $sailsSocket.get(BackEndUrl+'appointment?where={"patient":'+idPatient+', "doctor":'+idDoctor+', "start": {">": "'+new Date().toISOString()+'"}}&sort=start')
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
            return $sailsSocket.get(BackEndUrl+'appointment/getAppointmentsByDoctor/'+id)
                .success(function(data){
                    for (var i = 0; i < data.length; i++) {
                        data[i].start = new Date(data[i].start);
                        data[i].end = new Date(data[i].end);
                    }
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

        function cancelMailAppointment(id) {
            return $sailsSocket.post(BackEndUrl+'appointment/cancel', {
                id: id
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

        function addAppointment(dataToSend) {
            return $sailsSocket.post(BackEndUrl+'appointment/',dataToSend)
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

        function broadcastAppointment(dataToSend){
            return $sailsSocket.post(BackEndUrl+'appointment/broadcast', dataToSend)
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
                    return data;
                })
                .error(function(err){
                    console.log('Request Failed for getBroadcasted. ' + err)
                })
        }

        function getBroadcastedHistory(idDoctor){
            return $sailsSocket.get(BackEndUrl+'appointment/getBroadcastedHistory/'+idDoctor)
                .success(function(data){
                    return data;
                })
                .error(function(err){
                    console.log('Request Failed for getBroadcastedHistory. ' + err)

                })
        }

        function chooseAppointment(id, patientId) {
            return $sailsSocket.post(BackEndUrl+ 'appointment/chooseAppointment/', {
                id: id,
                patient: patientId,
                state: 'approved'
            })
                .success(function(data){
                    return data;
                })
                .error(function(err){
                    console.log('Request Failed for chooseAppointment. ' + err)
                    console.log(err)
                })
        }

        function cancelFirstAppointment(start, patient, doctor) {
          console.log(patient + ' ' + doctor);
          return $sailsSocket.get(BackEndUrl+'appointment?where={"patient":'+patient+', "doctor":'+doctor+', "state":{"!": "denied"}, "start": {">": "'+start+'"}}&sort=start')
            .success(function(data) {
              console.log(data);
              return $sailsSocket.delete(BackEndUrl+'appointment/'+data[0].id)
                  .success(function(data){
                      console.log(data);
                      return data;
                  })
                  .error(function(err){
                      console.log('Request Failed for deleteAppointment [Delete]. ' + err)
                  })
            })
            .error(function(err) {
              console.log('Request Failed for cancelFirstAppointment [Search]. ' + err)
              console.log(err)
            })
        }

        function incrNbValidated(id) {
            return $sailsSocket.get(BackEndUrl+ 'doctor/' + id)
                .success(function(data){
                    var nbValidated = data.nbValidated + 1;
                    return $sailsSocket.put(BackEndUrl+'doctor/'+id, {
                        nbValidated: nbValidated
                    });
                })
                .error(function(err){
                    console.log('Request Failed for incrNbValidated. ' + err)
                })
        }

        function incrNbGiven(id) {
            return $sailsSocket.get(BackEndUrl+ 'doctor/' + id)
                .success(function(data){
                    var nbGiven = data.nbGiven + 1;
                    return $sailsSocket.put(BackEndUrl+'doctor/'+id, {
                        nbGiven: nbGiven
                    });
                })
                .error(function(err){
                    console.log('Request Failed for incrNbGiven. ' + err)
                })
        }

        function incrNbCancelled(id) {
            return $sailsSocket.get(BackEndUrl+ 'doctor/' + id)
                .success(function(data){
                    var nbCancelled = data.nbCancelled + 1;
                    return $sailsSocket.put(BackEndUrl+'doctor/'+id, {
                        nbCancelled: nbCancelled
                    });
                })
                .error(function(err){
                    console.log('Request Failed for incrNbCancelled. ' + err)
                })
        }

        function subscribeAppointment(){
            return $sailsSocket.get(BackEndUrl+ 'appointment/subscribeAppointment/')
                .success(function(data){
                    console.log(data)
                })
                .error(function(err){
                    console.log('Request Failed for subscribe. ' + err)
                    console.log(err)
                })
        }

        function mailCancelled(id) {
            var dataToSend = {
                id: id
            };
            return $sailsSocket.post(BackEndUrl+ 'appointment/cancel/', dataToSend)
                .success(function(res) {
                    console.log('Request Succeded for mailCancelled.');
                    console.log(res);
                })
                .error(function(err) {
                    console.log('Request Failed for mailCancelled. ' + err)
                    console.log(err)
                })

        }

        function forgotPassword(email) {
            var dataToSend = {
                email: email
            };
            return $sailsSocket.post(BackEndUrl+ 'patient/forgot', dataToSend)
                .success(function(res) {
                    console.log('Request Succeded for forgotPassword.');
                    console.log(res);
                })
                .error(function(err) {
                    console.log('Request Failed for forgotPassword. ' + err);
                    console.log(err)
                })
        }

        function resetPassword(data) {
            return $sailsSocket.post(BackEndUrl+ 'patient/reset', data)
                .success(function(res) {
                    console.log('Request Succeded for resetPassword.');
                    console.log(res);
                })
                .error(function(err) {
                    console.log('Request Failed for resetPassword. ' + err);
                    console.log(err)
                })
        }

        function getAppointmentsByDoctorAndDate(id,dateStart,dateEnd)
        {
            return $sailsSocket.get(BackEndUrl+'appointment?where={"doctor":'+id+', "start": {">": "'+dateStart.toISOString()+'"},"end": {"<": "'+dateEnd.toISOString()+'"} }&populate=patient')
                .success(function(data){
                    for (var i = 0; i < data.length; i++) {
                        data[i].start = new Date(data[i].start);
                        data[i].end = new Date(data[i].end);
                    }
                    return data;
                })
                .error(function(err){
                    console.log('Request Failed for getAppointmentsByDoctor. ' + err );
                    return err;
                })
        }

        function getPendingAppointmentsByDoctor(id, dateStart)
        {
            var dateEnd = moment(dateStart).add(12, 'h');
            var email, phone;
            var appointments = [];
            return $sailsSocket.post(BackEndUrl+'appointment/getPendingAppointments', {doctor: id, start: dateStart.toISOString(), end: dateEnd.toISOString()})
                .success(function(data){
                    return data;
                })
                .error(function(err){
                    console.log('Request Failed for getPendingAppointmentsByDoctor. ' + err );
                    return err;
                })
        }

        function appointmentHappened(id, value) {
          return $sailsSocket.put(BackEndUrl+ 'appointment/' + id + '?populate=patient', {
              happened: value
          })
              .success(function(data){
                  return data;
              })
              .error(function(err){
                  console.log('Request Failed for appointmentHappened. ' + err)
              })
        }

        function moveAppointment(id, start, end) {
          return $sailsSocket.put(BackEndUrl+ 'appointment/' + id, {
              start: start,
              end: end
          })
              .success(function(data){
                  return data;
              })
              .error(function(err){
                  console.log('Request Failed for moveAppointment. ' + err)
              })
        }

        function extendAppointment(id, end) {
          return $sailsSocket.put(BackEndUrl+ 'appointment/' + id, {
              end: end
          })
              .success(function(data){
                  return data;
              })
              .error(function(err){
                  console.log('Request Failed for extendAppointment. ' + err)
              })
        }

        function editNote(idAppointment, note) {
          return $sailsSocket.put(BackEndUrl+ 'appointment/' + idAppointment, {
              notes: note
          })
              .success(function(data){
                  return data;
              })
              .error(function(err){
                  console.log('Request Failed for editNote. ' + err)
              })
        }

        function remindAppointment(app) {
          return $sailsSocket.post(BackEndUrl+ 'email/confirm', {
              app: app
          })
          .success(function(data){
            return data;
          })
          .error(function(err){
            console.log('Request Failed for remindAppointment.')
            console.log(err);
          })
        }

        function getCategoriesByDoctor(id) {
          return $sailsSocket.get(BackEndUrl+ 'doctor/'+ id +'/categories')
          .success(function(data){
            return data;
          })
          .error(function(err){
            console.log('Request Failed for getCategoriesByDoctor.')
            console.log(err);
          })
        }

        function addCategory(idDoctor, category) {
          return $sailsSocket.post(BackEndUrl+ 'category', {
            name: category.name,
            color: category.color,
            owner: idDoctor
          })
          .success(function(data){
            return data;
          })
          .error(function(err){
            console.log('Request Failed for getCategoriesByDoctor.')
            console.log(err);
          })
        }

        function deleteCategory(id) {
          return $sailsSocket.delete(BackEndUrl+'category/'+id)
          .success(function(data){
            return data;
          })
          .error(function(err){
            console.log('Request Failed for deleteCategory. ' + err)
          })
        }

        function getAvailableAppointments(doctor, days, periods, interval, week) {
          return $sailsSocket.post(BackEndUrl+ 'searchEngine/search', {
            doctor: doctor,
            days: days,
            periods: periods,
            interval: interval,
            week: week
          })
          .success(function(data){
            for (var i = 0; i < data.length; i++) {
              data[i] = new Date(data[i])
            }
            return data;
          })
          .error(function(err){
            console.log('Request Failed for getAvailableAppointments.')
            console.log(err);
          })
        }
    }
})();
