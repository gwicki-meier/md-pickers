/* global dayjs, angular */


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


function setCurrentSettingsToScope(scope) {
    var settings = scope.settings;

    if (angular.isDefined(scope.mdpSettings)) {
        var mdpSettings = scope.mdpSettings;
        if (mdpSettings.locale) {
            settings.currentLocale = mdpSettings.locale;
        } else {
            settings.currentLocale = "en";
        }

        // If "local", use timezone from Browser
        if (angular.isDefined(mdpSettings.timezone)) {
            settings.timezone = mdpSettings.timezone;
            settings.overrideTimezone = true;
        }

        settings.dateType = mdpSettings.dateType;

    } else {
        settings.currentLocale = "en";
        settings.overrideTimezone = false;
        settings.dateType = "date";
    }
}