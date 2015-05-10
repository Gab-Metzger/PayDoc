(function () {
    'use strict';

    angular
        .module('app.admin')
        .controller('AdminController', AdminController);

    AdminController.$inject = ['logger', 'dataservice', '$q', 'authservice', '$sailsSocket', '$rootScope','subscribeservice','$scope', '$compile', '$modal','uiCalendarConfig', 'ngDialog'];
    /* @ngInject */
    function AdminController(logger, dataservice, $q, authservice, $sailsSocket, $rootScope, subscribeservice,$scope, $compile, $modal,uiCalendarConfig, ngDialog) {
        var vm = this;
        vm.title = 'Admin';
        vm.patients = [];
        vm.appointments = [];
        vm.eventSources = [];


        var idCurrent = authservice.currentUser().id;

        if (!$rootScope.hasSubNotifDoctor){subscribeservice.notificationDoctor(idCurrent);}

        activate();

        dataservice.subscribeAppointment().success(function(data){});

        if (!$rootScope.hasSubscribed){
            $sailsSocket.subscribe('appointment', function(appointment){
                if (appointment.verb == "destroyed"){
                    angular.forEach(vm.appointments, function(app,key){
                        if(app.id == appointment.id ){
                            vm.appointments.splice(key, 1);
                        }
                    })
                    angular.forEach(vm.eventSources[0], function(app,key){
                        if(app.id == appointment.id ){
                            vm.eventSources[0].splice(key, 1);
                            $scope.myCalendar.fullCalendar('refetchEvents');
                        }
                    })
                }
                /*if(appointment.verb == "updated"){
                        angular.forEach(vm.appointments, function(app,key){
                            if(app.id == appointment.id ){
                                if(appointment.data.state) app.state = appointment.data.state;
                                if(appointment.data.patient) app.patient = appointment.data.patient;
                                logger.notifDesktop("Notification : " + app.patient.name + " à accepté un rendez-vous !");
                            }
                        })
                }*/
                if(appointment.previous){
                    if ( appointment.previous.doctor.id == authservice.currentUser().id ){
                      angular.forEach(vm.appointments, function(app,key){
                          if(app.id == appointment.id ){
                              if(appointment.data.state) {
                                  //app.title = appointment.data.title;
                                  app.state = appointment.data.state;
                                  $scope.myCalendar.fullCalendar('refetchEvents');
                              }
                          }
                      });
                      angular.forEach(vm.eventSources[0], function(app,key){
                          if(app.id == appointment.id ){
                              if(appointment.data.state) {
                                  app.state = appointment.data.state;
                                  switch(appointment.data.state) {
                                      case 'pending'   :  app.color = '#FFFF00';  break;
                                      case 'approved':  app.color = '#2EFE64 ';  break;
                                      case 'denied'  :  app.color = 'red';  break;
                                  }
                                  $scope.myCalendar.fullCalendar('refetchEvents');
                              }
                              if (appointment.data.happened == true) {
                                  app.title += "- arrivé";
                                  console.log("Le client est arrivé")
                              }
                          }
                      })
                    }
                }
            });
            $rootScope.hasSubscribed = true;
        }


        function activate() {
            var promises = [];
            return $q.all(promises).then(function() {
                var doctorConsultTime = authservice.currentUser().consultTime;
                // Calendar config
                vm.uiConfig = {
                    calendar:{
                        //height: 650,
                        defaultView: 'agendaWeek',
                        scrollTime: '8:00',
                        firstDay: 1,
                        selectable: true,
                        editable: true,
                        selectHelper: true,
                        axisFormat: 'HH:mm',
                        slotMinutes: doctorConsultTime,
                        allDaySlot: false,
                        allDayDefault: false,
                        allDay: false,
                        minTime: '08:00:00',
                        maxTime: '20:00:00',
                        timeFormat: {
                            '': 'HH:mm',
                            agenda: 'HH:mm'
                        },
                        columnFormat: {
                            month: 'ddd',
                            week: 'ddd dd/MM',
                            day: 'dddd'
                        },
                        //aspectRatio: 2,
                        monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
                        monthNamesShort: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
                        dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
                        dayNamesShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
                        titleFormat: {
                            month: 'MMMM yyyy',
                            week: 'dd MMMM yyyy',
                            day: 'dddd dd MMMM yyyy'
                        },
                        allDayText: "Journée",
                        buttonText: {
                            today: 'Aujourd\'hui',
                            day: 'Jour',
                            week: 'Semaine',
                            month: 'Mois'
                        },
                        header:{
                            left: 'agendaDay agendaWeek month',
                            center: 'title',
                            right: 'today prev,next'
                        },
                        //ignoreTimeZone: true,
                        timezone: "local",
                        viewRender: function(view,element){
                            vm.appointments.splice(0,vm.appointments.length);
                            vm.eventSources.splice(0,vm.eventSources.length);

                            dataservice.getAppointmentByDoctorAndDate(idCurrent,view.start,view.end).success(function (data) {
                                vm.appointments = data;
                                vm.eventSources.push(vm.appointments);
                            }).error(function(err){
                                console.log(err);
                            })
                        },
                        eventRender: function (event, element) {
                            element.bind("contextmenu", function(e) {
                                e.preventDefault();
                            });
                            element.bind('mousedown', function (e) {
                                if (e.which == 3) {
                                  ngDialog.openConfirm({
                                    template: 'app/widgets/modalConfirm.html',
                                    className: 'ngdialog-theme-default',
                                    data: {message: 'Voulez-vous supprimer ce rendez-vous ?'}
                                  }).then(function (value) {
                                    if (event.patient != null) {
                                        dataservice.cancelMailAppointment(event.id).success(function(res) {
                                            dataservice.deleteAppointment(event.id).success(function(data) {
                                                angular.forEach(vm.appointments, function(app,key){
                                                    if(app.id == data.id ){
                                                        vm.appointments.splice(key, 1);
                                                        logger.info('Le rendez-vous avec '+ event.patient.name + ' a été annulé !');
                                                    }
                                                })
                                            })
                                        });
                                        setTimeout(function() {
                                          ngDialog.openConfirm({
                                            template: 'app/widgets/modalConfirm.html',
                                            className: 'ngdialog-theme-default',
                                            data: {message: 'Voulez-vous proposer ce rendez-vous ?'}
                                          }).then(function (value) {
                                            var dataToSend = {
                                                start: event.start,
                                                end: event.end,
                                                doctor: idCurrent
                                            };
                                            dataservice.broadcastAppointment(dataToSend).success(function(res) {
                                                res.start = new Date(res.start);
                                                res.end = new Date(res.end);
                                                vm.appointments.push(res);
                                                logger.info("Le rendez-vous à été proposé ! ");
                                            });
                                            console.log('Proposed Modal promise resolved. Value: ', value);
                                          }, function (reason) {
                                            console.log('Proposed Modal promise rejected. Reason: ', reason);
                                          });
                                        },1000)
                                    }
                                    else {
                                        dataservice.deleteAppointment(event.id).success(function(data) {
                                            angular.forEach(vm.appointments, function(app,key){
                                                if(app.id == data.id ){
                                                    vm.appointments.splice(key, 1);
                                                    //vm.eventSources.splice(key,1);
                                                    logger.info('Le rendez-vous proposé a été annulé !');
                                                }
                                            })
                                        })
                                    }
                                    console.log('Cancel Modal promise resolved. Value: ', value);
                                  }, function (reason) {
                                    console.log('Cancel Modal promise rejected. Reason: ', reason);
                                  });
                                }
                            });

                            element.attr({'tooltip': event.notes, 'tooltip-append-to-body': true});
                            $compile(element)($scope);
                        },
                        eventClick: eventClick,
                        eventResize: actionOnResize,
                        eventDrop: actionOnDrop,
                        select: select
                    }
                };
            });
        }

        function getPatients() {
            return dataservice.getPatientsList().success(function (data) {
                vm.patients = data;
                return vm.patients;
            });
        }

        function actionOnResize(event, delta, revertFunc, jsEvent, ui, view) {
          return dataservice.extendAppointment(event.id, event.end)
            .success(function(data) {
              return data;
            })
        }

        function actionOnDrop(event, delta, revertFunc, jsEvent, ui, view) {
          return dataservice.moveAppointment(event.id, event.start, event.end)
            .success(function(data) {
              return data;
            })
        }


        function eventClick(event, jsEvent, view) {
            var modalInstance = $modal.open({
                templateUrl: 'app/widgets/modalAdminEdit.html',
                size: 'lg',
                controller: ['$modalInstance', '$scope',
                    function($modalInstance, $scope) {

                        activate();

                        function activate() {
                            event.patient.dateOfBirth = new Date(event.patient.dateOfBirth);
                            $scope.event = event;
                            $scope.state = event.state;
                            $scope.patient = event.patient;
                            $scope.editable = false;
                        }

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };

                        $scope.updatePatient = function(id, patient) {
                          return dataservice.updatePatient(id, patient)
                            .success(function (data) {
                                data.dateOfBirth = new Date(data.dateOfBirth);
                                $scope.patient = data;
                                logger.info('La fiche à été modifiée !');
                                $scope.editable = false;
                                $modalInstance.dismiss('cancel');
                                return data;
                            });
                        };

                        $scope.isHappened = function(id, value) {
                          return dataservice.appointmentHappened(id, value)
                            .success(function(data) {
                              event.happened = data.happened;
                              event.title = data.title;
                              $modalInstance.dismiss('cancel');
                              return data;
                            })
                        }

                        $scope.confirm = function() {
                          return dataservice.validateAppointment(event.id).success(function (data){
                              event.state = data.state;
                              event.color = '#2EFE64 ';
                              dataservice.incrNbValidated(idCurrent);
                              $modalInstance.dismiss('cancel');
                              return data;
                          });
                          logger.info('Le rendez-vous de '+ $scope.patient.name +' a été confirmé !')
                        }

                        $scope.switchEditable = function() {
                          $scope.editable = !$scope.editable;
                        }
                    }
                ]
            })
        }

        function select(start, end, jsEvent, view) {
            var modalInstance = $modal.open({
                templateUrl: 'app/widgets/modalAdmin.html',
                size: 'lg',
                resolve:{
                    patients: function(){
                        return vm.patients;
                    }
                },
                controller: ['$modalInstance', '$scope','patients',
                    function($modalInstance, $scope, patients) {

                        activate();

                        function activate() {
                            $scope.patients = patients;
                            $scope.addPatientButton = false;
                            $scope.searchInput = true;
                            $scope.newPatient = {};
                            $scope.notes = {};
                            $scope.start = start;
                            $scope.end = end;
                            $scope.editable = false;
                        }

                        $scope.loadPatient = function(val) {
                         return dataservice.loadPatientAsync(val).then(function(data) {
                           return data;
                         });
                        }

                        $scope.onSelect = function(patient){
                            patient.dateOfBirth = new Date(patient.dateOfBirth);
                            $scope.patient = patient;
                        };

                        $scope.addPatientButtonClick = function() {
                            $scope.addPatientButton = true;
                            $scope.searchInput = false;
                            $scope.editable = false;
                            $scope.patient = null;
                        };

                        $scope.updatePatient = function(id, patient) {
                          return dataservice.updatePatient(id, patient)
                            .success(function (data) {
                                data.dateOfBirth = new Date(data.dateOfBirth);
                                $scope.patient = data;
                                logger.info('La fiche à été modifiée !');
                                $scope.editable = false;
                                return data;
                            });
                        };

                        $scope.ok = function ($notify) {
                            addAppointment();
                            $notify && $notify();
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };

                        $scope.broadcast = function($notify) {
                            broadcastAppointment();
                            $notify && $notify();
                        };

                        $scope.switchEditable = function() {
                          $scope.editable = !$scope.editable;
                        };

                        $scope.addBlockedAppointment = function() {
                          var dataToSend = {
                              start: start,
                              end: end,
                              state: 'blocked',
                              patient: null,
                              doctor: idCurrent,
                              notes: $scope.notes.message
                          };
                          dataservice.addAppointment(dataToSend).success(function(data) {
                              data.start = new Date(data.start);
                              data.end = new Date(data.end);
                              vm.appointments.push(data);
                              $modalInstance.close();
                          });
                        };

                        function addAppointment() {
                            if ($scope.addPatientButton) {
                                addPatientThenAppointment()
                            }
                            else {
                                var dataToSend = {
                                    start: start,
                                    end: end,
                                    state: 'pending',
                                    patient: $scope.patient.id,
                                    doctor: idCurrent,
                                    notes: $scope.notes.message
                                };
                                dataservice.addAppointment(dataToSend).success(function(data) {
                                    data.start = new Date(data.start);
                                    data.end = new Date(data.end);
                                    vm.appointments.push(data);
                                    dataservice.incrNbGiven(idCurrent);
                                    $modalInstance.close();
                                });
                            }
                        }

                        function addPatientThenAppointment() {
                            if ($scope.newPatient.email == undefined) {
                                var email = $scope.newPatient.lastName.toLowerCase() + '.' + $scope.newPatient.firstName.toLowerCase() + (Math.floor(Math.random() * (100 - 1)) + 1).toString() + '@paydoc.fr';
                                $scope.newPatient.email = email;
                            }
                            dataservice.addPatient($scope.newPatient).success(function (data) {
                                var dataToSend = {
                                    start: start,
                                    end: end,
                                    state: 'pending',
                                    patient: data.id,
                                    doctor: idCurrent,
                                    notes: $scope.notes.message
                                };
                                dataservice.addAppointment(dataToSend).success(function(res) {
                                    res.start = new Date(res.start);
                                    res.end = new Date(res.end);
                                    vm.appointments.push(res);
                                    dataservice.incrNbGiven(idCurrent);
                                    logger.info('Le rendez-vous a été ajouté !');
                                    $modalInstance.close();
                                });
                            })
                        }

                        function broadcastAppointment() {
                            var dataToSend = {
                                start: start,
                                end: end,
                                doctor: idCurrent
                            };
                            dataservice.broadcastAppointment(dataToSend).success(function(res) {
                                res.start = new Date(res.start);
                                res.end = new Date(res.end);
                                vm.appointments.push(res);
                                logger.info("Le rendez-vous à été proposé ! ");
                                $modalInstance.close();
                            });
                        }
                    }
                ]
            })
        }
    }
})();
