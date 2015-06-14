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
    vm.switchEditable = switchEditable;
    vm.updatePatient = updatePatient;
    vm.addPatientButtonClick = addPatientButtonClick;

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
      var promises = [getCategories()];
      return $q.all(promises).then(function() {
        vm.color = {};
        vm.notes = {};
        vm.editable = false;
        vm.addPatientButton = false;
        vm.searchInput = true;
        vm.newPatient = {};
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
      return dataservice.getAvailableAppointments(idCurrent, days, periods, interval, vm.week)
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
      vm.week = 0;
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
      if (vm.addPatientButton) {
        addPatientThenAppointment(start)
      }
      else {
        var dataToSend = {
          start: moment(start).toDate(),
          end: moment(start).add(interval, 'm').toDate(),
          patient: vm.patient.id,
          doctor: idCurrent,
          notes: vm.notes.message,
          category: vm.color.name
        }
        dataservice.addAppointment(dataToSend).success(function(res) {
            dataservice.incrNbGiven(idCurrent);
            dialog.close();
            logger.info('Le rendez-vous a été ajouté !');
        });
      }
    }
        
    function addPatientButtonClick() {
      vm.addPatientButton = true;
      vm.searchInput = false;
      vm.editable = true;
      vm.patient = null;
    }

    function getCategories() {
      return dataservice.getCategoriesByDoctor(idCurrent)
      .success(function (data){
        vm.categories = data;
        return data;
      });
    }

    function switchEditable() {
      vm.editable = !vm.editable;
    }

    function updatePatient(id, patient) {
      return dataservice.updatePatient(id, patient)
      .success(function (data) {
        data.dateOfBirth = new Date(data.dateOfBirth);
        vm.patient = data;
        logger.info('La fiche à été modifiée !');
        vm.editable = false;
        return data;
      });
    }

    function addPatientThenAppointment(start) {
        if (vm.newPatient.email == undefined) {
            var email = vm.newPatient.lastName.toLowerCase() + '.' + vm.newPatient.firstName.toLowerCase() + (Math.floor(Math.random() * (100 - 1)) + 1).toString() + '@paydoc.fr';
            vm.newPatient.email = email;
        }
        vm.newPatient.dname = authservice.currentUser().lastName;
        dataservice.addPatient(vm.newPatient).success(function (data) {
            var dataToSend = {
                start: moment(start).toDate(),
                end: moment(start).add(interval, 'm').toDate(),
                state: 'pending',
                patient: data.id,
                doctor: idCurrent,
                notes: vm.notes.message,
                category: vm.color.name
            };
            dataservice.addAppointment(dataToSend).success(function(res) {
                res.start = new Date(res.start);
                res.end = new Date(res.end);
                dataservice.incrNbGiven(idCurrent);
                logger.info('Le rendez-vous a été ajouté !');
                dialog.close();
            });
        })
    }
  }
})();
