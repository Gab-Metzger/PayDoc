/* global toastr:false, moment:false */
(function() {
    'use strict';

    angular
        .module('app.core')
        .constant('toastr', toastr)
        .constant('moment', moment)
        .constant('USER_ROLES', {
            all: '*',
            doctor: 'doctor',
            patient: 'patient'
        })
        .constant('BackEndUrl', 'https://paydocapi.herokuapp.com/');
})();
