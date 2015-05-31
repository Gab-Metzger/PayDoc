(function () {
  'use strict';

  angular
  .module('app.searchengine')
  .controller('SearchEngineController', SearchEngineController);

  SearchEngineController.$inject = ['$q', 'dataservice', 'logger', 'authservice', '$sailsSocket', 'ngDialog', '$scope'];

  /* @ngInject */
  function SearchEngineController($q, dataservice, logger, authservice, $sailsSocket, ngDialog, $scope)
  {
    /* jshint validthis: true */
    var vm = this;
    vm.activate = activate;
    vm.addNewChoice = addNewChoice;
    vm.showAddChoice = showAddChoice;
    vm.search = search;
    vm.clear = clear;

    //Modal functions
    vm.openModal = openModal;
    vm.loadPatient = loadPatient;
    vm.onSelect = onSelect;
    vm.addAppointment = addAppointment;

    vm.title = 'Moteur de recherche';
    vm.choices = [{id: 'choice1'}];
    vm.week = 0;
    vm.availableAppointments = [];
    vm.isSearching = false;

    //Modal variables

    var idCurrent = authservice.currentUser().id;
    var interval = authservice.currentUser().consultTime;
    var dialog;

    activate();

    ////////////////


    function activate() {
      var promises = [];
      return $q.all(promises).then(function() {
      });
    }

    function addNewChoice() {
      if (vm.choices.length <= 2) {
        var newItemNo = vm.choices.length+1;
        vm.choices.push({'id':'choice'+newItemNo});
      }
      else {
        logger.error("Vous ne pouvez pas choisir plus de 3 jours.")
      }
    }

    function showAddChoice(choice) {
      return choice.id === vm.choices[vm.choices.length-1].id;
    };

    function search() {
      var days = [];
      var periods = [];
      angular.forEach(vm.choices, function(choice) {
        days.push(parseInt(choice.day));
        periods.push(choice.period);
      });
      return dataservice.getAvailableAppointments(days, periods, interval, vm.week)
      .success(function (data) {
        vm.availableAppointments = data;
        vm.isSearching = true;
        return data;
      })
      .error(function(err){
        console.log(err);
      })
    }

    function clear() {
      vm.choices = [{id: 'choice1'}];
      vm.availableAppointments = [];
      vm.isSearching = false;
    }

    function openModal(app) {
      dialog = ngDialog.open({
        template: 'app/searchengine/modalTemplate.html',
        className: 'ngdialog-theme-default',
        scope: $scope,
        data: {req: app}
      });
    }

    function loadPatient(val) {
      return dataservice.loadPatientAsync(val).then(function(data) {
        return data;
      });
    }

    function onSelect(patient){
      patient.dateOfBirth = new Date(patient.dateOfBirth);
      vm.patient = patient;
    }

    function addAppointment(start) {
      var dataToSend = {
        start: moment(start).toDate(),
        end: moment(start).add(interval, 'm').toDate(),
        patient: vm.patient.id,
        doctor: idCurrent
      }
      dataservice.addAppointment(dataToSend).success(function(res) {
          dataservice.incrNbGiven(idCurrent);
          dialog.close();
          logger.info('Le rendez-vous a été ajouté !');
      });
    }
  }
})();
