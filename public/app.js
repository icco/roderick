
// when-scrolled module.
angular.module('scroll', []).directive('whenScrolled', function() {
  return function(scope, element, attrs) {
    var $myWindow = angular.element($window);
    $myWindow.bind('scroll', function() {
      var elementHeight = element.height();
      var scrollAmount = $myWindow.scrollTop();
      var delta = 10;
      if (elementHeight - (scrollAmount + delta) < 0) {
        scope.$apply(attrs.whenScrolled);
      }
    });
  };
});

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
