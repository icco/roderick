
// when-scrolled module.
/*
angular.module('scroll', []).directive('whenScrolled', function() {
  return function(scope, elm, attr) {
    var raw = elm[0];

    elm.bind('scroll', function() {
      if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
        scope.$apply(attr.whenScrolled);
      }
    });
  };
});

*/

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

app.directive('scroller', function () {
  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {
      elem.bind('scroll', function () {
        rawElement = elem[0];
        if ((rawElement.scrollTop + rawElement.offsetHeight+5) >= rawElement.scrollHeight) {
          scope.$apply('loadData()');
        }
      });
    }
  };
});
