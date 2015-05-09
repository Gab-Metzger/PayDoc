(function () {
    'use strict';

    angular
        .module('app.mypatient')
        .controller('MyPatientController', MyPatientController);

    MyPatientController.$inject = ['logger', 'dataservice', '$q', 'authservice', '$sailsSocket', '$scope', '$http'];
    /* @ngInject */
    function MyPatientController(logger, dataservice, $q, authservice, $sailsSocket, $scope, $http) {
        $scope.title = 'Mes Patients';
        $scope.patients = [];
        $scope.appointments = [];
        $scope.patient = {};


        var idCurrent = authservice.currentUser().id;

        activate();

        function activate() {
            var promises = [];
            return $q.all(promises).then(function() {
              $scope.editable = false;
            });
        }

        function getPatients() {
            return dataservice.getPatientsList().success(function (data) {
                $scope.patients = data;
                console.log($scope.patients);
                return $scope.patients;
            });
        }

        $scope.loadPatient = function(val) {
         return dataservice.loadPatientAsync(val).then(function(data) {
           return data;
         });
        }

        $scope.updatePatient = function(id, patient) {
          return dataservice.updatePatient(id, patient)
            .success(function (data) {
                data.dateOfBirth = new Date(data.dateOfBirth);
                $scope.patient = data;
                logger.info('La fiche à été modifiée !');
                $scope.editable = false;
                return data;
            });
        }

        $scope.onSelect = function(patient){
            patient.dateOfBirth = new Date(patient.dateOfBirth);
            dataservice.getAppointmentsByPatientAndDoctor(patient.id, idCurrent).success(function(data) {
              $scope.appointments = data;
            });
            $scope.patient = patient;
        };

        $scope.switchEditable = function(){
          $scope.editable = !$scope.editable;
        };
    }
})();
