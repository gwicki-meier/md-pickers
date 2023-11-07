/**
 * Created by Robin Thoni on 6/21/17.
 */

Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}

angular.module('demo', [
    'ngMaterial',
    "ngMessages",
    'mdPickers'
])

.config(['$mdThemingProvider', function ($mdThemingProvider) {
	$mdThemingProvider.theme('dark').dark();
}])

.run(['$location', '$mdpLocale', function($location, $mdpLocale) {
    if (location.search !== '?useDefaults') { // Quick and dirty
        $mdpLocale.time.minTime = "00:00";
        $mdpLocale.time.maxTime = "23:59";
        $mdpLocale.time.timeFormat = "HH:mm";
        $mdpLocale.time.noFloat = true;
        $mdpLocale.time.openOnClick = false;
        $mdpLocale.time.autoSwitch = false;
        $mdpLocale.time.ampm = false;
        $mdpLocale.time.clearOnCancel = false;


        $mdpLocale.date.dateFormat = "DD.MM.YYYY";
        $mdpLocale.date.displayFormat = "ll";
        $mdpLocale.date.noFloat = true;
        $mdpLocale.date.openOnClick = false;
        $mdpLocale.date.clearOnCancel = false;

        $mdpLocale.moment.locale = "de-ch";
    }
}]);