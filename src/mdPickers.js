/* global moment, angular */


var module = angular.module("mdPickers", [
    "ngMaterial",
    "ngAnimate",
    "ngAria"
]);

module.config(["$mdIconProvider", "mdpIconsRegistry", function($mdIconProvider, mdpIconsRegistry) {
    angular.forEach(mdpIconsRegistry, function(icon, index) {
        $mdIconProvider.icon(icon.id, icon.url);
    });
}]);

module.run(["$templateCache", "mdpIconsRegistry", function($templateCache, mdpIconsRegistry) {
    angular.forEach(mdpIconsRegistry, function(icon, index) {
        $templateCache.put(icon.url, icon.svg);
    });
}]);


function setCurrentSettingsToScope(scope, newSettings) {
    var settings = scope.settings;
    settings.disableTimezone = false;
    settings.currentLocale = "en";


    if (angular.isDefined(newSettings)) {
        if (newSettings.currentLocale) {
            scope.settings.currentLocale = newSettings.currentLocale;
        }
        if (newSettings.locale) {
            scope.settings.currentLocale = newSettings.locale;
        }
        if (newSettings.disableTimezone) {
            settings.disableTimezone = true;
        }
    }
}

function newDate(settings) {
    let date = Date.now();
    if (angular.isUndefined(settings)) {
        return date;
    }
    let disableTimezone = false;
    if (settings.disableTimezone) {
        disableTimezone = true;
    }
    // If Timezone is disabled, we need to add the offset to the time, to set the current time to timepicker
    if (disableTimezone) {
        let offset = moment().utcOffset();
        date = date + offset * 60 * 1000;
    }
    return date
}


var extendedMoment = (function ({attrs, disableTimezone}){

    class DateTime {
        currentLocale = "de-ch";
        disableTimezone = false;
        moment;
        constructor({attrs, disableTimezone}){
            if (disableTimezone) {
                this.moment = moment.utc(...attrs);
                this.disableTimezone = true;
            } else {
                this.moment = moment.utc(...attrs).tz(moment.tz.guess())
                this.disableTimezone = false;
            }
        }
    }

    let dt = new DateTime({attrs, disableTimezone})

    DateTime.prototype.setLocale = function(value)  {
        this.currentLocale = value;
        this.moment.locale(value);
        return this;
    }

return dt
});

