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
        vm.cancelAppointment = cancelAppointment;
        vm.deleteAppointment = deleteAppointment;
        vm.addAppointment = addAppointment;
        vm.broadcastAppointment = broadcastAppointment;


        var idCurrent = authservice.currentUser().id;
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
                if(appointment.verb == "updated"){
                        angular.forEach(vm.historyAppointments, function(app,key){
                            if(app.id == appointment.id ){
                                if(appointment.data.state) app.state = appointment.data.state;
                                if(appointment.data.patient) app.patient = appointment.data.patient;
                                vm.appointments.push(app);
                                logger.notifDesktop("Notification : " + app.patient.name + " à accepté un rendez-vous !");
                                vm.historyAppointments.splice(key, 1);
                            }
                        })
                }
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
            var promises = [getPatients(), getAppointments(idCurrent), getBroadcastedHistory()];
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
                        //dayClick: dayClick,
                        select: select,
                        eventRender: function(event, element, view)
                        {
                            element.on('mousedown',{element:element,event:event,view:view} , rightClick);
                        }
                        //eventMouseover: eventMouseover,
                        //eventDrop: eventDrop,
                        //eventResize: eventResize,
                        //eventRender: eventRender
                    }
                };
                console.log(vm.appointments);
                console.log(vm.eventSources);
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

        function cancelAppointment(id) {
            dataservice.cancelAppointment(id).success(function (data){
                angular.forEach(vm.appointments, function(app,key) {
                    if (app.id == data.id) {
                        if (data.state) app.state = data.state;
                    }
                });
                dataservice.incrNbCancelled(idCurrent);
                dataservice.mailCancelled(id);
            });
            logger.info('Le rendez-vous a été annulé !')
        }

        function deleteAppointment(id, isHistory) {
            dataservice.deleteAppointment(id).success(function (data){
                if (isHistory) {
                    angular.forEach(vm.historyAppointments, function(app,key) {
                        if (app.id == data.id) {
                            vm.historyAppointments.splice(key,1);
                        }
                    })
                }
                else {
                    angular.forEach(vm.appointments, function(app,key) {
                        if (app.id == data.id) {
                            vm.appointments.splice(key,1);
                        }
                    })
                }

            });
            logger.info('Le rendez-vous a été supprimé !')
        }

        function addAppointment(idPatient) {
            dataservice.addAppointment(idPatient,idCurrent,vm.dt).success(function(data) {
                vm.appointments.push(data[0]);
                vm.patient = null;
                vm.selected = '';
                dataservice.incrNbGiven(idCurrent);
            });
            logger.info('Le rendez-vous a été ajouté !')
        }

        function broadcastAppointment(){
            console.log("BroadcastAppointment");
            console.log(vm.date);
            dataservice.broadcastAppointment(idCurrent,vm.date).success(function(data){
                vm.historyAppointments.push(data);
                logger.info("Le rendez-vous à été proposé ! ");

            })
        }

        function getBroadcastedHistory() {
            dataservice.getBroadcastedHistory(idCurrent).success(function (data) {
                vm.historyAppointments = data;
            })
        }

        function dayClick(date, allDay, jsEvent, view) {
            console.log('click' + date + ' ' + allDay);
        }

        //event.which = 3 is right click
        function rightClick(event){
            if(event.which == 3) console.log("event right click .....")
        }


        function select(start, end, jsEvent, view) {
            //var newEventTitle;
            //prompt(newEventTitle);
            //vm.appointments.push({start: start, end: end, title: newEventTitle});
            //console.log(start + ' ' + end);
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
                        }

                        $scope.onSelect = function(patient){
                            $scope.patient = patient;
                        };

                        $scope.addPatientButtonClick = function() {
                            $scope.addPatientButton = true;
                            $scope.searchInput = false;
                        };

                        $scope.ok = function () {
                            addAppointment();
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };

                        $scope.broadcast = function() {
                            broadcastAppointment();
                        }

                        function addAppointment() {
                            var dataToSend = {
                                start: start,
                                end: end,
                                patient: $scope.patient.id,
                                doctor: idCurrent
                            };
                            dataservice.addAppointment(dataToSend).success(function(data) {
                                data[0].start = new Date(data[0].start);
                                data[0].end = new Date(data[0].end);
                                vm.appointments.push(data[0]);
                                dataservice.incrNbGiven(idCurrent);
                                $modalInstance.close();
                            });
                        }

                        function broadcastAppointment() {
                            var dataToSend = {
                                start: start,
                                end: end,
                                state: 'pending',
                                allDay: false,
                                title: 'RdV Proposé',
                                doctor: idCurrent,
                                color: 'violet'
                            }
                            vm.eventSources.push([dataToSend]);
                            $modalInstance.close();
                        }
                    }
                ]
            })
        }
    }
})();
