// Create application module.
var app = angular.module('roderick', []);

// Add a controller to it.
app.controller('DictCtrl', function($scope, $http) {

   // A scope function to load the data.
   $scope.loadData = function () {
      $http.get('/words.json').success(function(data) {
         $scope.entries = data;
      });
   };
});
