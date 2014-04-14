angular.module('drinksApp', [])
    .factory('History', function() {
        var items = [];
        return {
            getItems: function() {
                return items;
            },
            addDrink: function(drink) {
                items.push(drink);
            },
            sum: function() {
                return items.reduce(function(total, drink) {
                    return total + drink.price;
                }, 0);
            }
        };
    })
    .factory('???', function() {
        var permil = 0.0;
        return {
            calculatePermille: function() {
                return items.reduce(function(total, drink) {
                    return total + drink.price;
                }, 0);
            }
        };
    })
    .controller('DrinksCtrl', function($scope, $http, History){
        $scope.history = History;

        $scope.drinks = [
            {"id": "1", "name": "Bier", "price": 5 },
            {"id": "2", "name": "Wein",    "price": 5.5 },
            {"id": "3", "name": "Schnaps", "price": 6 },
            {"id": "4", "name": "Alkopop", "price": 0 }
        ];
    })
    .controller('HistoryCtrl', function($scope, History){
        $scope.history = History;
    });