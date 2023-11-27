
import DemoController from "./demoController";
import mdPickers from 'md-pickers';

export default angular.module("demo", [
    mdPickers
])
    .config(['$mdThemingProvider', function ($mdThemingProvider) {
        $mdThemingProvider.theme('dark').dark();
    }])
    .run(['demoAppService', function(demoAppService) {}])
    .run(['$location', '$mdpLocale', function ($location, $mdpLocale) {
            if (location.search !== '?useDefaults') { // Quick and dirty
                $mdpLocale.time.minTime = "00:00";
                $mdpLocale.time.maxTime = "23:59";
                $mdpLocale.time.timeFormat = "LT";
                $mdpLocale.time.noFloat = true;
                $mdpLocale.time.openOnClick = false;
                $mdpLocale.time.autoSwitch = false;
                $mdpLocale.time.ampm = false;
                $mdpLocale.time.clearOnCancel = false;


                $mdpLocale.date.dateFormat = "L";
                $mdpLocale.date.displayFormat = "ddd DD MMM";
                $mdpLocale.date.noFloat = true;
                $mdpLocale.date.openOnClick = false;
                $mdpLocale.date.clearOnCancel = false;
            }
        }]
    )
    .controller("demoController", DemoController)
    .name;
