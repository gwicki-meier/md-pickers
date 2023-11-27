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
    var settings = scope.settings = {};
    var localTZ = dayjs.tz.guess();

    if (angular.isDefined(scope.advancedSettings)) {

        var advancedSettings = scope.advancedSettings;
        if (advancedSettings.locale) {
            scope.currentLocale = advancedSettings.locale;
            settings.locale = scope.currentLocale;
        } else {
            scope.currentLocale = "en";
            settings.locale = "en";
        }
        if (advancedSettings.timezone === "local") {
            scope.currentTZ = localTZ;
            settings.timezone = scope.currentTZ;
        } else if (advancedSettings.timezone !== localTZ) {
            scope.currentTZ = advancedSettings.timezone;
            settings.timezone = scope.currentTZ;

        } else {
            scope.currentTZ = localTZ;
            settings.timezone = scope.currentTZ;
        }

    } else {
        settings.locale = "en";
        settings.timezone = localTZ;
        scope.settings = settings;
        scope.currentTZ = settings.timezone
        scope.currentLocale = settings.locale
    }
}