var drinksApp = angular.module('drinksApp', ['ngRoute', 'ngAnimate']);

drinksApp.factory('History', function() {
    var records = [];
    var timestamp = 0;

    return {
        getDrinks: function() {
            return records;
        },
        addDrink: function(drink) {

            // Get drink properties (dummy)
            //drink = {'id':'0', 'name':'Bier','permille': 0.05, 'liquid': 500, 'duration': 30};

            // Get drinking time
            timestamp = new Date().getTime();

            // Push drink and drinking time to array
            records.push({'drink': drink, 'time': timestamp});
        }
    };
});

drinksApp.controller('AlcoholCtrl', function($scope, $interval, $window, History, $log) {
    // Array to hold timestamps and BAC values [{'17:50','0.13'},{'17:51','0.14'}, ...]
    $scope.bac_data = [];

    // Current blood alcohol concentration (g alc/kg blood)
    $scope.bac = 0;

    var now_label = "";

    $scope.max_bac = 0;

    // Drinks menu
    $scope.menu = [
        {'id':'0', 'name':'Beer','permille': 5, 'liquid': 500, 'duration': 30},
        {'id':'1', 'name':'Spirit','permille': 0.45, 'liquid': 40, 'duration': 2},
        {'id':'3', 'name':'Cocktail','permille': 15, 'liquid': 300, 'duration': 20},
        {'id':'4', 'name':'Wine','permille': 10, 'liquid': 200, 'duration': 30}
    ];

    // History service
    $scope.history = History;

    // Define calculation interval in milliseconds
    $scope.interval = 60000;

    $scope.time_to_sober = 0;

    // Regularly update BAC display
    $interval(function() {
        if ($scope.history.getDrinks().length > 0) {
            $scope.bac_data = getBACData();

            now_label = pad(new Date().getHours())+":"+pad(new Date().getMinutes());
            $scope.bac = $scope.bac_data[now_label];
        }
    }, $scope.interval);

    function getBACData() {
        // TODO Replace associative arrays with numeric ones for performance and easier iterating

        // TODO Add resorption delay (until drink reaches digestion tract)

        /* Calculation vars */
        // Alcohol mass (g)
        var alcohol = 0;

        // Person's details
        var age = 27;
        var height = 170;
        var weight = 68;

        // Total body water
        var total_body_water = 2.447 - 0.09516 * age + 0.1074 * height + 0.3362 * weight;

        // Calculation interval in milliseconds (1 min = 60 s = 60000 ms)
        var interval = $scope.interval;

        // Formatted time: "15:30"
        var current_interval_label = "";

        // Alcohol stack for storing alcohol mass for every interval
        var alc_data = [];

        // BAC stack for storing permille values for every interval
        var bac_data = [];

        // Interval distribution vars
        var parts_count = 0;
        var parts_size = 0;
        var next_interval_label = "";
        var next_interval_timestamp = 0;

        // Alcohol depletion vars
        // 0,15 g/kg = 0,15 permille per hour --> Interval: 1 minute => 0,0025 permille / minute depletion
        var bac_depletion = 0.15/(3600/(interval/1000));
        var last_bac = 0;
        var VALID_BAC_EXISTS = false;

        // Get drinks records from "History" service
        var records = $scope.history.getDrinks();

        // Now (s)
        var now_timestamp = new Date().getTime();

        // Initialize interval timestamp with time of first drink (s)
        var current_interval_timestamp = records[0].time;

        //
        // 1) Distribute alcohol of all drinks proportionally to intervals depending on drinking duration
        //

        // For every interval step between "first drink" and "now"...
        while (current_interval_timestamp <= now_timestamp) {

            // Formatted time: "15:30" for current interval
            current_interval_label = pad(new Date(current_interval_timestamp).getHours())+":"+
                pad(new Date(current_interval_timestamp).getMinutes());

            // Fetch existing alcohol mass from stack
            if (alc_data[current_interval_label] != undefined) {

                //$log.log("Auf Intervall "+current_interval_label+" liegen "+alc_data[current_interval_label]+" g Alkohol");

                alcohol = alc_data[current_interval_label];
            } else {
                // Initialize alcohol mass for every interval
                alcohol = 0;
            }

            // "for (key in array)" works for "most cases"
            // TODO Find a more compatible solution for "foreach"-loop

            // For every drink...
            for (key in records) {
                // If drink was consumed in current interval...
                if (records[key].time >= current_interval_timestamp - interval / 2 &&
                    records[key].time <= current_interval_timestamp + interval / 2) {

                    // Calculate alcohol mass of drink

                    // Alcohol mass (g) = Volume of drink (ml) * alc volume percentage (e.g. 0,05) * density of alcohol (0,8 g/ml)
                    alcohol = alcohol + (records[key].drink.liquid * (records[key].drink.permille / 100) * 0.8);

                    //$log.log("Alkohol-Masse für alle Getränke in diesem Intervall: "+alcohol);

                    // If drinking time (min) > interval (min) distribute alcohol evenly
                    if (records[key].drink.duration > interval/60/1000) {

                        // Calculate parts
                        parts_count = Math.ceil(records[key].drink.duration/(interval/60/1000));

                        // Calculate size of each part
                        parts_size = alcohol/parts_count;

                        // Distribute parts to later intervals
                        for (var j = 0; j <= parts_count; j++) {
                            next_interval_timestamp = j * interval + current_interval_timestamp;

                            next_interval_label = pad(new Date(next_interval_timestamp).getHours())+":"+
                                pad(new Date(next_interval_timestamp).getMinutes());

                            if (isNaN(alc_data[next_interval_label])) {
                                alc_data[next_interval_label] = parts_size;
                            } else {
                                alc_data[next_interval_label] += parts_size;
                            }
                        }
                        // Assign first part OR complete alcohol mass for further calculation
                        alcohol = parts_size;
                    } else {

                        // ...just add alcohol mass to current interval
                        if (isNaN(alc_data[current_interval_label])) {
                            alc_data[current_interval_label] = alcohol;
                        } else {
                            alc_data[current_interval_label] += alcohol;
                        }
                    }
                }
            }

            //$log.log("alc_data:");
            //$log.log(alc_data);

            //
            // 2) Calculate blood alcohol concentration (BAC)
            //

            // BAC calculation according to Watson
            if (alcohol > 0) {
                if (bac_data[current_interval_label] > 0) {
                    $log.log("Alter Wert: "+bac_data[current_interval_label]);
                    bac_data[current_interval_label] += ((0.8 * alcohol)/(1.055 * total_body_water)) * 0.8;
                    $log("Neuer Wert: "+bac_data[current_interval_label]);
                } else {
                    bac_data[current_interval_label] = ((0.8 * alcohol)/(1.055 * total_body_water)) * 0.8;
                }
            }

            /*
             * Resorption times
             * Schnaps (um 40 Vol%) ca. 10 %
             * Wein/Sekt (um 10 Vol%) ca. 20 %
             * Bier (um 5 Vol%) ca. 30 %
             */

            //
            // 3) Subtract BAC depletion and fill bac_data with times (21:40) and permilles (0.14)
            //

            /*
             new_bac = bac_data[current_interval_label] - bac_depletion;

             $log.log("Berechne bac_data[current_interval_label] - bac_depletion: "
             +bac_data[current_interval_label]+" permil - "+bac_depletion+" = "+new_bac+" permil ");


             if (new_bac < 0) {
             bac_data[current_interval_label] = 0;
             $log.log("Neuer Promille-Wert unter Null");
             } else {
             bac_data[current_interval_label] = new_bac;
             }
             */

            // Iterate to next interval
            current_interval_timestamp = current_interval_timestamp + interval;
        }

        // (Pre-)Calculate BAC data for all intervals that have alcohol
        for (key in alc_data) {
            // Last BAC value + BAC value calculated for this interval
            bac_data[key] = last_bac +
                ((0.8 * alc_data[key]) / (1.055 * total_body_water)) * 0.8;

            /*
             $log.log("Intervall: " + key + " | Last BAC: "+last_bac+
             " | Berechne Promille für Alkoholmasse von "+ alc_data[key] +" g | Berechnete BAC:" + bac_data[key]);
             */
            last_bac = bac_data[key];
        }

        // Deplete alcohol in bac_data until "sober" (bac_data[lastElement] == 0)
        // TODO Try to resolve redundancy with code above

        // Begin from first interval
        current_interval_timestamp = records[0].time;

        var last_interval_label = "";

        // As long as there is alcohol to deplete...
        while (last_bac > 0) {

            // Format time for current interval (e.g. "15:30")
            current_interval_label = pad(new Date(current_interval_timestamp).getHours())+":"+
                pad(new Date(current_interval_timestamp).getMinutes());

            last_interval_label = pad(new Date(current_interval_timestamp - interval).getHours())+":"+
                pad(new Date(current_interval_timestamp - interval).getMinutes());

            // Set flag to remember current BAC value if there is one
            VALID_BAC_EXISTS = !isNaN(bac_data[current_interval_label]);

            // If BAC value is valid (positive)...
            if (last_bac - bac_depletion > 0) {

                // Subtract bac_depletion from the element
                bac_data[current_interval_label] = last_bac - bac_depletion;

                // Iterate to next interval
                current_interval_timestamp = current_interval_timestamp + interval;

            } else {
                // End while loop, stop writing values into BAC-array
                bac_data[current_interval_label] = 0;
                last_bac = 0;
            }

            // Save current BAC value
            if (VALID_BAC_EXISTS) {
                last_bac = bac_data[current_interval_label];
            } else {
                last_bac = bac_data[last_interval_label];
            }
        }

        $log.log("bac_data:");
        $log.log(bac_data);

        // Update time to sober
        $scope.time_to_sober = current_interval_label;

        return bac_data;
    }

    function pad(value) {
        if(value < 10) {
            return '0' + value;
        } else {
            return value;
        }
    }
});