//create your application module.
var app = angular.module('myApp', []);

//add a controller to it
app.controller('MyCtrl', function($scope, $http) {

   //a scope function to load the data.
   $scope.loadData = function () {
      $http.get('/Your/Sinatra/Route').success(function(data) {
         $scope.items = data;
      });
   };

});
