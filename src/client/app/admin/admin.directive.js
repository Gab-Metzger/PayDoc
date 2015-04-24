(function () {
    'use strict';

    angular
        .module('app.admin')
        .directive('clickAndDisable', clickAndDisable);

    clickAndDisable.$inject = [];
    /* @ngInject */
    function clickAndDisable() {
      return {
        scope: {
          clickAndDisable: '&'
        },
        link: function(scope, iElement, iAttrs) {
          iElement.bind('click', function() {
            iElement.prop('disabled',true);
            scope.clickAndDisable().finally(function() {
              iElement.prop('disabled',false);
            })
          });
        }
      };
    }
})();
