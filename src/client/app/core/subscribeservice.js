/**
 * Created by abrantes on 14/02/15.
 */
(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('subscribeservice', subscribeservice);

    subscribeservice.$inject = ['$http', 'BackEndUrl', '$sailsSocket','logger','$rootScope'];
    /* @ngInject */
    function subscribeservice($http, BackEndUrl, $sailsSocket,logger,$rootScope) {
        var service = {
            notificationDoctor : notificationDoctor
        };

        return service;

        function notificationDoctor(doctorId){
            $rootScope.hasSubNotifDoctor = true;
            $sailsSocket.subscribe('appointment', function(appointment){
                if(appointment.previous){
                    if ( appointment.previous.doctor.id == doctorId ){
                        if (appointment.verb === 'destroyed') {
                            logger.notifDesktop("Notification : Le rendez-vous avec " + appointment.previous.patient.name + " a été supprimé !");
                        }
                        else {
                            if (appointment.data.state === 'approved') {
                                logger.notifDesktop("Notification : Le rendez-vous avec " + appointment.previous.patient.name + " a été validé !")
                            }
                            else if (appointment.data.state === 'denied') {
                                logger.notifDesktop("Notification : Le rendez-vous avec " + appointment.previous.patient.name + " a été annulé !")
                            }
                        }

                    }
                }
            })
        }




    }
})();
