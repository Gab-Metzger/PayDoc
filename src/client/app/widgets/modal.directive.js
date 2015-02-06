(function () {
    'use strict';

    angular
        .module('app.widgets')
        .directive('ngReallyClick', ngReallyClick);

    ngReallyClick.$inject = ['$modal'];
    /* @ngInject */
    function ngReallyClick ($modal) {
        //Usage:
        //<a ng-really-message="Are you sure ?" ng-really-click="reallyDelete(item)" item="item">Delete</a>
        var ModalInstanceCtrl = function($scope, $modalInstance) {
            $scope.ok = function() {
                $modalInstance.close();
            };

            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };
        };

        return {
            restrict: 'A',
            scope:{
                ngReallyClick:"&",
                item:"="
            },
            link: function(scope, element, attrs) {
                element.bind('click', function() {
                    var message = attrs.ngReallyMessage || "Êtes-vous sûr ? ?";

                    /*
                     //This works
                     if (message && confirm(message)) {
                     scope.$apply(attrs.ngReallyClick);
                     }
                     //*/

                    //*This doesn't works
                    var modalHtml = '<div class="modal-body">' + message + '</div>';
                    modalHtml += '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button><button class="btn btn-warning" ng-click="cancel()">Cancel</button></div>';

                    var modalInstance = $modal.open({
                        template: modalHtml,
                        controller: ModalInstanceCtrl
                    });

                    modalInstance.result.then(function() {
                        scope.ngReallyClick({item:scope.item}); //raise an error : $digest already in progress
                    }, function() {
                        //Modal dismissed
                    });
                    //*/

                });

            }
        }
    }
})();
