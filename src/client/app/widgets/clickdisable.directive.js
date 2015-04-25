(function () {
    'use strict';

    angular
        .module('app.widgets')
        .directive('clickAndDisable', clickDisable);

    /* @ngInject */
    function clickDisable($parse, $q, $timeout) {
      var link = function(scope, elem, attr) {
    var isNotifyMode = attr.clickAndDisable.indexOf('$notify') > -1;
    var fn = $parse(attr.clickAndDisable, null, true);
    var previousText = elem.text();

    var disableBtn = function() {
      elem.text('wait...');
      elem.attr('disabled', 'disabled');
    };
    var enableBtn = function() {
      elem.text(previousText);
      elem.attr('disabled', '');
    };

    elem.on('click', function(event) {
      scope.$apply(function() {
        if (isNotifyMode) {
          disableBtn();
        }
        fn(scope, {
          $event: event,
          $notify: function() {
            enableBtn();
          }
        });
      });
    });

  };
  return {
    link: link,
    restict: 'A',
  }
    }
})();
