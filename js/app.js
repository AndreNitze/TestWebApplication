angular.module('tutorialApp', [])
    .factory('History', function() {
        var items = [];
        return {
            getItems: function() {
                return items;
            },
            addDrink: function(drink) {
                items.push(drink);
            }
        };
    })
    .controller('HistoryCtrl', function($scope, $http, History){

       // $scope.history = History;

        $http.get('https://mobile-quality-research.org/services/drinks/').then(function(historyResponse) {
            $scope.drinks = historyResponse.data;
        });

       // $scope.drinks = History;

        /*
        $http.get('https://www.mobile-quality-research.org/services/meals').success(function(data) {
            $scope.meals = data;
        });
        */
    });