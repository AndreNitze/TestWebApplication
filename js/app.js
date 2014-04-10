angular.module('tutorialApp', [])
    .controller('PersonsCtrl', function($scope, $http){

        $http.get('https://www.mobile-quality-research.org/services/meals').success(function(data) {
            $scope.meals = data;
        });
    });