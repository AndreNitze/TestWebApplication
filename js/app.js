    'use strict';
    var app = angular.module('drinksApp', ['ngRoute', 'ngAnimate']);
/*
    app.factory('Drinker', function() {
        var items = [];
        var bac = 0.04;

        return {
            getDrinks: function() {
                return items;
            },
            addDrink: function(drink) {
                items.push(drink);
            },
            getBAC: function() {
                return 0.05;
            }
        };
    });
*/
    /*
    app.controller('DrinksCtrl', function($scope, $http, History){
        $scope.history = History;

        $scope.drinks = [
            {"id": "1", "name": "Bier", "price": 5 },
            {"id": "2", "name": "Wein",    "price": 5.5 },
            {"id": "3", "name": "Schnaps", "price": 6 },
            {"id": "4", "name": "Alkopop", "price": 0 }
        ];
    });
    app.controller('HistoryCtrl', function($scope, History){
        $scope.history = History;
    });
    */

    app.controller('AlcoholCtrl', function($scope) {
        $scope.bac = 0.99;

        function greet() {
            alert("test");
        }
    });
    /*
    app.config(function($routeProvider) {
        $routeProvider.when('/',
        {
            controller: 'HomeCtrl',
            templateUrl: 'views/home.html'
        })
        .when('/settings',
        {
            controller: 'SettingsCtrl',
            templateUrl: 'views/settings.html'
        })
    });
    */