// Create application module.
var app = angular.module('roderick', []);

// Add a controller to it.
app.controller('DictCtrl', function($scope, $http) {
  if ($scope.entries == undefined) {
    $scope.entries = [];
  }
  if ($scope.counter == undefined) {
    $scope.counter = 1;
  }

  // A scope function to load the data.
  $scope.loadData = function () {
    $http.get('/words/' + $scope.counter + '.json').success(function(data) {
      $scope.entries = $scope.entries.concat(data)
      $scope.counter += 1;
      console.log($scope.counter);
    });
  };

  $scope.loadData();
});

// scroller
app.directive('scroller', function () {
  return {
    restrict: 'A',
    scope: {
      scroller: "&"
    },
    link: function (scope, elem, attrs) {
      raw = elem[0];
      elem.bind('scroll', function () {
        if ((raw.scrollTop + raw.offsetHeight + 20) >= raw.scrollHeight) {
          scope.$apply(scope.scroller);
        }
      });
    }
  };
});
