(function () {
    'use strict';

    angular
        .module('app.admin')
        .controller('AdminController', AdminController);

    AdminController.$inject = ['logger', 'dataservice', '$q', 'authservice', '$sailsSocket', '$rootScope','subscribeservice','$scope', '$compile', '$modal'];
    /* @ngInject */
    function AdminController(logger, dataservice, $q, authservice, $sailsSocket, $rootScope, subscribeservice,$scope, $compile, $modal) {
        var vm = this;
        vm.title = 'Admin';
        vm.patients = [];
        vm.appointments = [];
        vm.eventSources = [];
        vm.getPatientById = getPatientById;


        var idCurrent = authservice.currentUser().id;
        console.log(idCurrent);
        if (!$rootScope.hasSubNotifDoctor){subscribeservice.notificationDoctor(idCurrent);}
        //$scope.$watch('subscribeservice.test',function(newValue){
        //    console.log(newValue);
        //})
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
                                if(appointment.data.state) app.state = appointment.data.state;
                            }
                        })
                    }
                }
            });
            $rootScope.hasSubscribed = true;
        }


        function activate() {
            var promises = [getPatients(), getAppointments(idCurrent)];
            return $q.all(promises).then(function() {
                var doctorConsultTime = authservice.currentUser().consultTime;
                // Calendar config
                vm.uiConfig = {
                    calendar:{
                        //height: 650,
                        defaultView: 'agendaWeek',
                        scrollTime: '8:00',
                        firstDay: 1,
                        editable: true,
                        selectable: true,
                        selectHelper: true,
                        axisFormat: 'HH:mm',
                        slotMinutes: doctorConsultTime,
                        allDaySlot: false,
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
                        select: select,
                        eventRender: function (event, element) {
                            element.bind("contextmenu", function(e) {
                                e.preventDefault();
                            });

                            element.bind('mousedown', function (e) {
                                if (e.which == 3) {
                                    if(confirm('Voulez-vous annuler ce rendez-vous ?')) {
                                        console.log(event.patient);
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
                                            })
                                        }
                                        else {
                                            dataservice.deleteAppointment(event.id).success(function(data) {
                                                angular.forEach(vm.appointments, function(app,key){
                                                    if(app.id == data.id ){
                                                        vm.appointments.splice(key, 1);
                                                        logger.info('Le rendez-vous proposé a été annulé !');
                                                    }
                                                })
                                            })
                                        }
                                    }
                                }
                            });

                            element.attr({'tooltip': event.notes, 'tooltip-append-to-body': true});
                            $compile(element)($scope);
                        },
                        eventClick: eventClick
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

        function getAppointments(id) {
            return dataservice.getAppointmentsByDoctor(id).success(function (data) {
                vm.appointments = data;
                vm.eventSources.push(data);
                return vm.appointments;
            });
        }

        function getPatientById(id) {
            return dataservice.getPatientById(id)
                .success(function (data) {
                    return data.name;
                });
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
                                return data;
                            });
                        };

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

                        $scope.ok = function () {
                            addAppointment();
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };

                        $scope.broadcast = function() {
                            broadcastAppointment();
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
