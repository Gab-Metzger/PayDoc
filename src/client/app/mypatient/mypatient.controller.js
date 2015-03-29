(function () {
    'use strict';

    angular
        .module('app.mypatient')
        .controller('MyPatientController', MyPatientController);

    MyPatientController.$inject = ['logger', 'dataservice', '$q', 'authservice', '$sailsSocket', '$scope'];
    /* @ngInject */
    function MyPatientController(logger, dataservice, $q, authservice, $sailsSocket, $scope) {
        $scope.title = 'Mes Patients';
        $scope.patients = [];
        $scope.appointments = [];
        $scope.patient = {};


        var idCurrent = authservice.currentUser().id;

        activate();

        function activate() {
            var promises = [getPatients()];
            return $q.all(promises).then(function() {
              $scope.editable = false;
            });
        }

        function getPatients() {
            return dataservice.getPatientsList().success(function (data) {
                $scope.patients = data;
                return $scope.patients;
            });
        }

        $scope.updatePatient = function(id, patient) {
          return dataservice.updatePatient(id, patient)
            .success(function (data) {
                $scope.patient = data;
                logger.info('La fiche à été modifiée !');
                $scope.editable = false;
                return data;
            });
        }

        $scope.onSelect = function(patient){
            dataservice.getAppointmentsByPatient(patient.id).success(function(data) {
              $scope.appointments = data;
            });
            $scope.patient = patient;
        };

        $scope.switchEditable = function(){
          $scope.editable = !$scope.editable;
        };

        function getPatientByName(val) {
          dataservice.getPatientByName(val).success(function(err, data) {
            if (err) console.log(err)
            else
              console.log(data);
          })
        }
    }
})();
