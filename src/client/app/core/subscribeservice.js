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
            console.log("Notification Doctor ! ")
            $rootScope.hasSubNotifDoctor = true;
            $sailsSocket.subscribe('appointment', function(appointment){
                if(appointment.previous){
                    if ( appointment.previous.doctor.id == doctorId ){
                        if (appointment.verb === 'destroyed') {
                            logger.info("Notification : Le rendez-vous avec " + appointment.previous.patient.name + " a été supprimé !");
                        }
                        else {
                            if (appointment.data.state === 'approved') {
                                logger.info("Notification : Le rendez-vous avec " + appointment.previous.patient.name + " a été validé !")
                            }
                            else if (appointment.data.state === 'denied') {
                                logger.info("Notification : Le rendez-vous avec " + appointment.previous.patient.name + " a été annulé !")
                            }
                        }

                    }
                }
            })
        }




    }
})();
