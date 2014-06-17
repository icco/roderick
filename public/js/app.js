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
      if ($scope.entries.length > 150) {
        $scope.entries = $scope.entries.slice($scope.entries.length - 151);
        console.log($scope.entries.length, $scope.entries[0], $scope.entries[150]);
      }
      $scope.counter += 1;
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
        // console.log(raw.scrollTop);
        // 100 padding for get time
        if ((raw.scrollTop + raw.offsetHeight + 100) >= raw.scrollHeight) {
          scope.$apply(scope.scroller);
        }
      });
    }
  };
});
