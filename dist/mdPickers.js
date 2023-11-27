(function() {
"use strict";
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
module.constant("mdpIconsRegistry", [
    {
        id: 'mdp-chevron-left',
        url: 'mdp-chevron-left.svg',
        svg: '<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'
    },
    {
        id: 'mdp-chevron-right',
        url: 'mdp-chevron-right.svg',
        svg: '<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'
    },
    {
        id: 'mdp-access-time',
        url: 'mdp-access-time.svg',
        svg: '<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M0 0h24v24H0z" fill="none"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>'
    },
    {
        id: 'mdp-event',
        url: 'mdp-event.svg',
        svg: '<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'
    }
]);
/**
 * Created by Robin Thoni on 6/21/17.
 */

module.factory('$mdpLocale', [function () {
    return {
        time: {
            minTime: null,
            maxTime: null,
            okLabel: "OK",
            cancelLabel: "Cancel",
            timeFormat: "HH:mm",
            noFloat: true,
            openOnClick: false,
            autoSwitch: false,
            ampm: false,
            clearOnCancel: false,
        },
        date: {
            minDate: null,
            maxDate: null,
            okLabel: "OK",
            cancelLabel: "Cancel",
            dateFilter: null,
            dateFormat: "YYYY-MM-DD",
            displayFormat: "ddd, MMM DD",
            noFloat: true,
            openOnClick: false,
            clearOnCancel: false
        }
    };
}]);

module.directive("ngMessage", ["$mdUtil", function($mdUtil) {
   return {
        restrict: "EA",
        priority: 101,
        compile: function(element) {
            var inputContainer = $mdUtil.getClosest(element, "mdp-time-picker", true) ||
                                 $mdUtil.getClosest(element, "mdp-date-picker", true);

            // If we are not a child of an input container, don't do anything
            if (!inputContainer) return;

            // Add our animation class
            element.toggleClass('md-input-message-animation', true);

            return {};
        }
    }

}]);
/* global dayjs, angular */

function DatePickerCtrl($scope, $mdDialog, $mdMedia, $timeout, currentDate, options) {
    var self = this;

    var settings = options.settings;
    $scope.currentTZ = settings.timezone;
    $scope.currentLocale = settings.locale;

    this.date = dayjs(currentDate).tz($scope.currentTZ).locale($scope.currentLocale);
    this.minDate = options.minDate && dayjs(options.minDate).tz($scope.currentTZ).locale($scope.currentLocale).isValid() ? dayjs(options.minDate).tz($scope.currentTZ).locale($scope.currentLocale) : null;
    this.maxDate = options.maxDate && dayjs(options.maxDate).tz($scope.currentTZ).locale($scope.currentLocale).isValid() ? dayjs(options.maxDate).tz($scope.currentTZ).locale($scope.currentLocale) : null;
    this.displayFormat = options.displayFormat || "ddd, MMM DD";
    this.dateFilter = angular.isFunction(options.dateFilter) ? options.dateFilter : null;
    this.selectingYear = false;

    // validate min and max date
    if (this.minDate && this.maxDate) {
        if (this.maxDate.isBefore(this.minDate)) {
            this.maxDate = dayjs(this.minDate).tz($scope.currentTZ).locale($scope.currentLocale).add(1, 'days');
        }
    }

    if (this.date) {
        // check min date
        if (this.minDate && this.date.isBefore(this.minDate)) {
            this.date = dayjs(this.minDate).tz($scope.currentTZ).locale($scope.currentLocale);
        }

        // check max date
        if (this.maxDate && this.date.isAfter(this.maxDate)) {
            this.date = dayjs(this.maxDate).tz($scope.currentTZ).locale($scope.currentLocale);
        }
    }

    this.yearItems = {
        currentIndex_: 0,
        PAGE_SIZE: 5,
        START: (self.minDate ? self.minDate.year() : 1900),
        END: (self.maxDate ? self.maxDate.year() : 0),
        getItemAtIndex: function(index) {
            if(this.currentIndex_ < index)
                this.currentIndex_ = index;

            return this.START + index;
        },
        getLength: function() {
            return Math.min(
                this.currentIndex_ + Math.floor(this.PAGE_SIZE / 2),
                Math.abs(this.START - this.END) + 1
            );
        }
    };

    $scope.$mdMedia = $mdMedia;
    $scope.year = this.date.year();

    this.selectYear = function(year) {
        self.date = self.date.year(year);
        $scope.year = year;
        self.selectingYear = false;
        self.animate();
    };

    this.showYear = function() {

        self.yearTopIndex = (self.date.year() - self.yearItems.START) + Math.floor(self.yearItems.PAGE_SIZE / 2);
        self.yearItems.currentIndex_ = (self.date.year() - self.yearItems.START) + 1;
        self.selectingYear = true;
    };

    this.showCalendar = function() {
        self.selectingYear = false;
    };

    this.cancel = function() {
        $mdDialog.cancel();
    };

    this.confirm = function() {
        var date = this.date;

        if (this.minDate && this.date.isBefore(this.minDate)) {
            date = dayjs(this.minDate).tz($scope.currentTZ).locale($scope.currentLocale);
        }

        if (this.maxDate && this.date.isAfter(this.maxDate)) {
            date = dayjs(this.maxDate).tz($scope.currentTZ).locale($scope.currentLocale);
        }

        $mdDialog.hide(date.toDate());
    };

    this.animate = function() {
        self.animating = true;
        $timeout(angular.noop).then(function() {
            self.animating = false;
        })

    };
}

module.provider("$mdpDatePicker", function() {
    var LABEL_OK = "OK",
        LABEL_CANCEL = "Cancel",
        DISPLAY_FORMAT = "ddd, MMM DD",
        PARENT_GETTER = function() { return undefined };

    this.setDisplayFormat = function(format) {
        DISPLAY_FORMAT = format;

    };

    this.setOKButtonLabel = function(label) {
        LABEL_OK = label;
    };

    this.setCancelButtonLabel = function(label) {
        LABEL_CANCEL = label;
    };

    this.setDialogParentGetter = function(fn) {
        PARENT_GETTER = fn;
    };

    this.$get = ["$mdDialog", "$mdpLocale", function($mdDialog, $mdpLocale) {
        return function (currentDate, options) {
            if (!angular.isDate(currentDate)) currentDate = Date.now();
            if (!angular.isObject(options)) options = {};

            options.displayFormat = options.displayFormat || $mdpLocale.date.displayFormat || DISPLAY_FORMAT;

            var labelOk = options.okLabel || $mdpLocale.date.okLabel || LABEL_OK;
            var labelCancel = options.cancelLabel || $mdpLocale.date.cancelLabel || LABEL_CANCEL;

            return $mdDialog.show({
                controller: ['$scope', '$mdDialog', '$mdMedia', '$timeout', 'currentDate', 'options', DatePickerCtrl],
                controllerAs: 'datepicker',
                clickOutsideToClose: true,
                template: '<md-dialog aria-label="" class="mdp-datepicker" ng-class="{ \'portrait\': !$mdMedia(\'gt-xs\') }">' +
                    '<md-dialog-content layout="row" layout-wrap>' +
                    '<div layout="column" layout-align="start center">' +
                    '<md-toolbar layout-align="start start" flex class="mdp-datepicker-date-wrapper md-hue-1 md-primary" layout="column">' +
                    '<span class="mdp-datepicker-year" ng-click="datepicker.showYear()" ng-class="{ \'active\': datepicker.selectingYear }">{{ datepicker.date.format(\'YYYY\') }}</span>' +
                    '<span class="mdp-datepicker-date" ng-click="datepicker.showCalendar()" ng-class="{ \'active\': !datepicker.selectingYear }">{{ datepicker.date.format(datepicker.displayFormat) }}</span> ' +
                    '</md-toolbar>' +

                    '</div>' +

                    '<div>' +

                    '<div class="mdp-datepicker-select-year mdp-animation-zoom" layout="column" layout-align="center start" ng-if="datepicker.selectingYear">' +
                    '<md-virtual-repeat-container md-auto-shrink md-top-index="datepicker.yearTopIndex">' +
                    '<div flex md-virtual-repeat="item in datepicker.yearItems" md-on-demand class="repeated-year">' +
                    '<span class="md-button" ng-click="datepicker.selectYear(item)" md-ink-ripple ng-class="{ \'md-primary current\': item == year }">{{ item }}</span>' +
                    '</div>' +
                    '</md-virtual-repeat-container>' +
                    '</div>' +
                    '<mdp-calendar ng-if="!datepicker.selectingYear" class="mdp-animation-zoom" date="datepicker.date" min-date="datepicker.minDate" date-filter="datepicker.dateFilter" max-date="datepicker.maxDate"></mdp-calendar>' +
                    '<md-dialog-actions layout="row">' +
                    '<span flex></span>' +
                    '<md-button ng-click="datepicker.cancel()" aria-label="' + labelCancel + '">' + labelCancel + '</md-button>' +
                    '<md-button ng-click="datepicker.confirm()" class="md-primary" aria-label="' + labelOk + '">' + labelOk + '</md-button>' +
                    '</md-dialog-actions>' +
                    '</div>' +
                    '</md-dialog-content>' +
                    '</md-dialog>',
                targetEvent: options.targetEvent,
                locals: {
                    currentDate: currentDate,
                    options: options
                },
                multiple: true,
                parent: PARENT_GETTER()
            });
        };
    }];
});

function CalendarCtrl($scope) {
    var self = this;

    this.$onInit = function () {
        self.daysInMonth = [];
        self.dow = dayjs.localeData().firstDayOfWeek();
        self.weekDays = [].concat(
            dayjs.weekdaysMin().slice(self.dow),
            dayjs.weekdaysMin().slice(0, self.dow)
        );
        $scope.$watch(function () {
            return self.date.unix()
        }, function (newValue, oldValue) {
            if (newValue && newValue !== oldValue)
                self.updateDaysInMonth();
        });
        self.updateDaysInMonth();
    };

    this.getDaysInMonth = function() {
        var days = self.date.daysInMonth(),
            firstDay = self.date.date(1).day() - this.dow;

        if(firstDay < 0) firstDay = this.weekDays.length - 1;

        var arr = [];
        for(var i = 1; i <= (firstDay + days); i++) {
            var day = null;
            if(i > firstDay) {
                day =  {
                    value: (i - firstDay),
                    enabled: self.isDayEnabled(self.date.date(i - firstDay).toDate())
                };
            }
            arr.push(day);
        }

        return arr;
    };

    this.isDayEnabled = function(day) {
        return (!this.minDate || this.minDate <= day) &&

            (!this.maxDate || this.maxDate >= day) &&

            (!self.dateFilter || !self.dateFilter(day));
    };

    this.selectDate = function(dom) {
        self.date = self.date.date(dom);
    };

    this.nextMonth = function() {
        self.date = self.date.add(1, 'months');
    };

    this.prevMonth = function() {
        self.date = self.date.subtract(1, 'months');
    };

    this.updateDaysInMonth = function() {
        self.daysInMonth = self.getDaysInMonth();
    };

    $scope.$watch(function() { return  self.date.unix() }, function(newValue, oldValue) {
        if(newValue && newValue !== oldValue)
            self.updateDaysInMonth();
    });
}

module.directive("mdpCalendar", ["$animate", function($animate) {
    return {
        restrict: 'E',
        bindToController: {
            "date": "=",
            "minDate": "=",
            "maxDate": "=",
            "dateFilter": "="
        },
        template: '<div class="mdp-calendar">' +
                    '<div layout="row" layout-align="space-between center">' +
                        '<md-button aria-label="previous month" class="md-icon-button" ng-click="calendar.prevMonth()"><md-icon md-svg-icon="mdp-chevron-left"></md-icon></md-button>' +
                        '<div class="mdp-calendar-monthyear" ng-show="!calendar.animating">{{ calendar.date.format("MMMM YYYY") }}</div>' +
                        '<md-button aria-label="next month" class="md-icon-button" ng-click="calendar.nextMonth()"><md-icon md-svg-icon="mdp-chevron-right"></md-icon></md-button>' +
                    '</div>' +
                    '<div layout="row" layout-align="space-around center" class="mdp-calendar-week-days" ng-show="!calendar.animating">' +
                        '<div layout layout-align="center center" ng-repeat="d in calendar.weekDays track by $index">{{ d }}</div>' +
                    '</div>' +
                    '<div layout="row" layout-align="start center" layout-wrap class="mdp-calendar-days" ng-class="{ \'mdp-animate-next\': calendar.animating }" ng-show="!calendar.animating" md-swipe-left="calendar.nextMonth()" md-swipe-right="calendar.prevMonth()">' +
                        '<div layout layout-align="center center" ng-repeat-start="day in calendar.daysInMonth track by $index" ng-class="{ \'mdp-day-placeholder\': !day }">' +
                            '<md-button class="md-icon-button" aria-label="Select day" ng-mouseenter="raised = true" ng-mouseleave="raised = false" ng-if="day" ng-class="{ \'md-accent\': calendar.date.date() == day.value, \'md-raised\': raised || calendar.date.date() == day.value }" ng-dblclick="datepicker.confirm()" ng-click="calendar.selectDate(day.value)" ng-disabled="!day.enabled">{{ day.value }}</md-button>' +
                        '</div>' +
                        '<div flex="100" ng-if="($index + 1) % 7 == 0" ng-repeat-end></div>' +
                    '</div>' +
                '</div>',
        controller: ["$scope", CalendarCtrl],
        controllerAs: "calendar",
        link: function(scope, element, attrs, ctrl) {
            var animElements = [
                element[0].querySelector(".mdp-calendar-week-days"),
                element[0].querySelector('.mdp-calendar-days'),
                element[0].querySelector('.mdp-calendar-monthyear')
            ].map(function(a) {
               return angular.element(a);

            });

            scope.raised = false;

            scope.$watch(function() { return  ctrl.date.format("YYYYMM") }, function(newValue, oldValue) {
                var direction = null;

                if(newValue > oldValue)
                    direction = "mdp-animate-next";
                else if(newValue < oldValue)
                    direction = "mdp-animate-prev";

                if(direction) {
                    for(var i in animElements) {
                        animElements[i].addClass(direction);
                        $animate.removeClass(animElements[i], direction);
                    }
                }
            });
        }
    }
}]);

function formatValidator(scope, value, format) {
    return !value || angular.isDate(value) ||dayjs(value, format, scope.currentLocale,true).tz(scope.currentTZ).isValid();
}

function compareDateValidator(scope, value, format, otherDate, comparator) {
    // take only the date part, not the time part
    if (angular.isDate(otherDate)) {
        otherDate = dayjs(otherDate).tz(scope.currentTZ).locale(scope.currentLocale).format(format);
    }
    otherDate = dayjs(otherDate, format, scope.currentLocale, true).tz(scope.currentTZ);
    var date = angular.isDate(value) ? dayjs(value).tz(scope.currentTZ).locale(scope.currentLocale) :  dayjs(value, format, scope.currentLocale, true).tz(scope.currentTZ);

    return !value ||
            angular.isDate(value) ||
            !otherDate.isValid() ||
            comparator(date, otherDate);
}

function minDateValidator(scope, value, format, minDate) {
    return compareDateValidator(scope, value, format, minDate, function(d, md) { return d.isSameOrAfter(md); });
}

function maxDateValidator(scope, value, format, maxDate) {
    return compareDateValidator(scope, value, format, maxDate, function(d, md) { return d.isSameOrBefore(md); });
}

function filterValidator(scope, value, format, filter) {
    var date = angular.isDate(value) ? dayjs(value).tz(scope.currentTZ).locale(scope.currentLocale) :  dayjs(value, format, scope.currentLocale, true).tz(scope.currentTZ);

    return !value ||
            angular.isDate(value) ||
            !angular.isFunction(filter) ||
            !filter(date.toDate());
}

function requiredValidator(scope, value, ngModel) {
    return value
}

module.directive("mdpDatePicker", ["$mdpDatePicker", "$timeout", "$mdpLocale", function($mdpDatePicker, $timeout, $mdpLocale) {
    return  {
        restrict: 'E',
        require: ['ngModel', "^^?form"],
        transclude: true,
        template: function(element, attrs) {
            var noFloat = angular.isDefined(attrs.mdpNoFloat) || $mdpLocale.date.noFloat,
                openOnClick = angular.isDefined(attrs.mdpOpenOnClick) || $mdpLocale.date.openOnClick;

            return '<div layout layout-align="start start">' +
                    '<md-button' + (angular.isDefined(attrs.mdpDisabled) ? ' ng-disabled="disabled"' : '') + ' class="md-icon-button" ng-click="showPicker($event)">' +
                        '<md-icon md-svg-icon="mdp-event"></md-icon>' +
                    '</md-button>' +
                    '<md-input-container' + (noFloat ? ' md-no-float' : '') + ' md-is-error="isError()">' +
                        '<input size="10" name="{{ inputName }}"  ng-required="required()" type="{{ ::type }}"' + (angular.isDefined(attrs.mdpDisabled) ? ' ng-disabled="disabled"' : '') + ' aria-label="{{placeholder}}" placeholder="{{placeholder}}"' + (openOnClick ? ' ng-click="showPicker($event)" ' : '') + ' />' +
                    '</md-input-container>' +
                '</div>';
        },
        scope: {
            "minDate": "=mdpMinDate",
            "maxDate": "=mdpMaxDate",
            "okLabel": "@?mdpOkLabel",
            "cancelLabel": "@?mdpCancelLabel",
            "dateFilter": "=mdpDateFilter",
            "dateFormat": "@mdpFormat",
            "placeholder": "@mdpPlaceholder",
            "noFloat": "=mdpNoFloat",
            "openOnClick": "=mdpOpenOnClick",
            "disabled": "=?mdpDisabled",
            "inputName": "@?mdpInputName",
            "clearOnCancel": "=?mdpClearOnCancel",
            "advancedSettings": "=?mdpSettings"
        },
        link: {
            pre: function(scope, element, attrs, constollers, $transclude) {

            },
            post: function(scope, element, attrs, controllers, $transclude) {
                var ngModel = controllers[0];
                var form = controllers[1];

                var opts = {
                    get minDate() {
                        return scope.minDate || $mdpLocale.date.minDate;
                    },
                    get maxDate() {
                        return scope.maxDate || $mdpLocale.date.maxDate;
                    },
                    get dateFilter() {
                        return scope.dateFilter || $mdpLocale.date.dateFilter;
                    },
                    get clearOnCancel() {
                        return angular.isDefined(scope.clearOnCancel) ? scope.clearOnCancel : $mdpLocale.date.clearOnCancel;
                    },
                    get settings() {
                        console.log(scope.settings)
                        return scope.settings;
                    }
                };

                var inputElement = angular.element(element[0].querySelector('input')),
                    inputContainer = angular.element(element[0].querySelector('md-input-container')),
                    inputContainerCtrl = inputContainer.controller("mdInputContainer");

                $transclude(function(clone) {
                    inputContainer.append(clone);
                });

                var messages = angular.element(inputContainer[0].querySelector("[ng-messages]"));
                var settings = {};

                scope.type = scope.dateFormat || $mdpLocale.date.dateFormat ? "text" : "date";
                scope.dateFormat = scope.dateFormat || $mdpLocale.date.dateFormat || "YYYY-MM-DD";
                scope.model = ngModel;
                scope.settings = settings;

                setCurrentSettingsToScope(scope);

                scope.isError = function() {
                    return !!ngModel.$invalid && (!ngModel.$pristine || (form != null && form.$submitted));
                };

                scope.required = function() {
                    return !!attrs.required;
                };

                // update input element if model has changed
                ngModel.$formatters.unshift(function(value) {
                    var date = angular.isDate(value) && dayjs(value).tz(scope.currentTZ).locale(scope.currentLocale);
                    if(date && date.isValid()) {
                        var strVal = date.format(scope.dateFormat);
                        updateInputElement(strVal);
                        return strVal;
                    } else {
                        updateInputElement(null);
                        return null;
                    }
                });

                ngModel.$validators.format = function(modelValue, viewValue) {
                    return formatValidator(scope, viewValue, scope.dateFormat);
                };

                ngModel.$validators.minDate = function(modelValue, viewValue) {
                    return minDateValidator(scope, viewValue, scope.dateFormat, opts.minDate);
                };

                ngModel.$validators.maxDate = function(modelValue, viewValue) {
                    return maxDateValidator(scope, viewValue, scope.dateFormat, opts.maxDate);
                };

                ngModel.$validators.filter = function(modelValue, viewValue) {
                    return filterValidator(scope, viewValue, scope.dateFormat, opts.dateFilter);
                };

                ngModel.$validators.required = function(modelValue, viewValue) {
                    return angular.isUndefined(attrs.required) || attrs.required === false || !ngModel.$isEmpty(modelValue) || !ngModel.$isEmpty(viewValue);
                };

                ngModel.$parsers.unshift(function(value) {
                    var parsed = dayjs(value, scope.dateFormat, scope.currentLocale, true).tz(scope.currentTZ);
                    if(parsed.isValid()) {
                        if(angular.isDate(ngModel.$modelValue)) {
                            var originalModel = dayjs(ngModel.$modelValue).tz(scope.currentTZ).locale(scope.currentLocale);
                            originalModel = originalModel.year(parsed.year());
                            originalModel = originalModel.month(parsed.month());
                            originalModel = originalModel.date(parsed.date());

                            parsed = originalModel;
                        }
                        return parsed.toDate();

                    } else
                        return null;
                });

                // update input element value
                function updateInputElement(value) {
                    inputElement[0].value = value;
                    inputContainerCtrl.setHasValue(!ngModel.$isEmpty(value));
                }

                function updateDate(date) {
                    var value = null;
                    if (!angular.isDate(date)) {
                        value = dayjs(date, scope.dateFormat, scope.currentLocale, true).tz(scope.currentTZ);
                        if (!value.isValid() && (scope.dateFormat === "L")) {
                            value = dayjs(date, "l", scope.currentLocale, true).tz(scope.currentTZ);
                        }
                    } else {
                        value = dayjs(date).tz(scope.currentTZ).locale(scope.currentLocale);
                    }
                    var strValue = value.format(scope.dateFormat);

                    if(value.isValid()) {
                        updateInputElement(strValue);
                        ngModel.$setViewValue(strValue);
                    } else {
                        updateInputElement(ngModel.$viewValue);
                    }

                    if(!ngModel.$pristine &&

                        messages.hasClass("md-auto-hide") &&

                        inputContainer.hasClass("md-input-invalid")) messages.removeClass("md-auto-hide");

                    ngModel.$render();
                }

                scope.showPicker = function(ev) {
                    $mdpDatePicker(ngModel.$modelValue, {
                        minDate: opts.minDate,
                        maxDate: opts.maxDate,
                        dateFilter: opts.dateFilter,
                        okLabel: scope.okLabel,
                        cancelLabel: scope.cancelLabel,
                        targetEvent: ev,
                        settings: opts.settings
                    }).then(function(time) {
                        updateDate(time, true);
                    }, function (error) {
                        if (opts.clearOnCancel) {
                            updateDate(null, true);
                        }
                    });
                };

                function onInputElementEvents(event) {
                    if(event.target.value !== ngModel.$viewValue)
                        updateDate(event.target.value);
                }

                inputElement.bind("blur", onInputElementEvents);

                scope.$on("$destroy", function() {
                    inputElement.off("reset input blur", onInputElementEvents);
                });

                // revalidate on constraint change
                scope.$watch("minDate + maxDate", function() {
                    ngModel.$validate();
                });
            }
        }
    };
}]);

module.directive("mdpDatePicker", ["$mdpDatePicker", "$timeout", function($mdpDatePicker, $timeout) {
    return  {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            "minDate": "@min",
            "maxDate": "@max",
            "okLabel": "@?mdpOkLabel",
            "cancelLabel": "@?mdpCancelLabel",
            "dateFilter": "=mdpDateFilter",
            "dateFormat": "@mdpFormat"
        },
        link: function(scope, element, attrs, ngModel, $transclude) {
            scope.dateFormat = scope.dateFormat || "YYYY-MM-DD";

            ngModel.$validators.format = function(modelValue, viewValue) {
                return formatValidator(scope, viewValue, scope.format);
            };

            ngModel.$validators.minDate = function(modelValue, viewValue) {
                return minDateValidator(scope, viewValue, scope.format, scope.minDate);
            };

            ngModel.$validators.maxDate = function(modelValue, viewValue) {
                return maxDateValidator(scope, viewValue, scope.format, scope.maxDate);
            };

            ngModel.$validators.filter = function(modelValue, viewValue) {
                return filterValidator(scope, viewValue, scope.format, scope.dateFilter);
            };

            function showPicker(ev) {
                $mdpDatePicker(ngModel.$modelValue, {
                    minDate: scope.minDate,
                    maxDate: scope.maxDate,
                    dateFilter: scope.dateFilter,
                    okLabel: scope.okLabel,
                    cancelLabel: scope.cancelLabel,
                    targetEvent: ev
                }).then(function(time) {
                    ngModel.$setViewValue(dayjs(time).tz(scope.currentTZ).locale(scope.currentLocale).format(scope.format));
                    ngModel.$render();
                });
            };

            element.on("click", showPicker);

            scope.$on("$destroy", function() {
                element.off("click", showPicker);
            });
        }
    }
}]);
/* global dayjs, angular */

function TimePickerCtrl($scope, $mdDialog, time, autoSwitch, ampm, $mdMedia, options) {
    var self = this;

    var settings = options.settings;
    $scope.currentTZ = settings.timezone;
    $scope.currentLocale = settings.locale;

    console.log(options.settings)

    this.VIEW_HOURS = 1;
    this.VIEW_MINUTES = 2;
    this.currentView = this.VIEW_HOURS;
    this.time = dayjs(time).tz($scope.currentTZ).locale($scope.currentLocale);
    this.autoSwitch = !!autoSwitch;
    this.ampm = !!ampm;

    this.hoursFormat = self.ampm ? "h" : "H";
    this.minutesFormat = "mm";

    this.clockHours = parseInt(this.time.format(this.hoursFormat));
    this.clockMinutes = parseInt(this.time.format(this.minutesFormat));

    $scope.$mdMedia = $mdMedia;

    this.switchView = function() {
        self.currentView = self.currentView == self.VIEW_HOURS ? self.VIEW_MINUTES : self.VIEW_HOURS;
    };

    this.setAM = function() {
        if(self.time.hour() >= 12)
            self.time = self.time.hour(self.time.hour() - 12);
    };

    this.setPM = function() {
        if(self.time.hour() < 12)
            self.time = self.time.hour(self.time.hour() + 12);
    };

    this.cancel = function() {
        $mdDialog.cancel();
    };

    this.confirm = function() {
        $mdDialog.hide(this.time.toDate());
    };
}

function ClockCtrl($scope) {
    var self = this;
    var TYPE_HOURS = "hours";
    var TYPE_MINUTES = "minutes";

    this.$onInit = function () {
        self.STEP_DEG = 360 / 12;
        self.steps = [];
        this.CLOCK_TYPES = {
            "hours": {
                range: self.ampm ? 12 : 24,
            },
            "minutes": {
                range: 60,
            }
        };
        self.type = self.type || "hours";

        switch (self.type) {
            case TYPE_HOURS:
                var f = self.ampm ? 1 : 2;
                var t = self.ampm ? 12 : 23;
                for(var i = f; i <= t; i+=f)
                    self.steps.push(i);
                if (!self.ampm) self.steps.push(0);
                self.selected = self.time.hour() || 0;
                if(self.ampm && self.selected > 12) self.selected -= 12;

                break;
            case TYPE_MINUTES:
                for(var i = 5; i <= 55; i+=5)
                    self.steps.push(i);
                self.steps.push(0);
                self.selected = self.time.minute() || 0;

                break;
        }
    };

    this.getPointerStyle = function() {
        var divider = 1;
        switch(self.type) {
            case TYPE_HOURS:
                divider = self.ampm ? 12 : 24;
                break;
            case TYPE_MINUTES:
                divider = 60;
                break;
        }

        var degrees = Math.round(self.selected * (360 / divider)) - 180;
        return {

            "-webkit-transform": "rotate(" + degrees + "deg)",
            "-ms-transform": "rotate(" + degrees + "deg)",
            "transform": "rotate(" + degrees + "deg)"
        }
    };

    this.setTimeByDeg = function(deg) {
        deg = deg >= 360 ? 0 : deg;
        var divider = 0;
        switch(self.type) {
            case TYPE_HOURS:
                divider = self.ampm ? 12 : 24;
                break;
            case TYPE_MINUTES:
                divider = 60;
                break;
        }

        self.setTime(
            Math.round(divider / 360 * deg)
        );
    };

    this.setTime = function(time, type) {
        this.selected = time;

        switch(self.type) {
            case TYPE_HOURS:
                if(self.ampm && self.time.format("A") === "PM") time += 12;
                this.time = this.time.hour(time);
                break;
            case TYPE_MINUTES:
                if(time > 59) time -= 60;
                this.time = this.time.minute(time);
                break;
        }

    };
}

module.directive("mdpClock", ["$animate", "$timeout", function($animate, $timeout) {
    return {
        restrict: 'E',
        bindToController: {
            'type': '@?',
            'time': '=',
            'autoSwitch': '=?',
            'ampm': '=?'
        },
        replace: true,
        template: '<md-card class="mdp-clock">' +
                        '<div class="mdp-clock-container">' +
                            '<md-toolbar class="mdp-clock-center md-primary"></md-toolbar>' +
                            '<md-toolbar ng-style="clock.getPointerStyle()" class="mdp-pointer md-primary">' +
                                '<span class="mdp-clock-selected md-button md-raised md-primary"></span>' +
                            '</md-toolbar>' +
                            '<md-button ng-class="{ \'md-primary\': clock.selected == step || (step == clock.steps[clock.steps.length - 1] && clock.selected == 0), \'md-raised\': raised || clock.selected == step  }" ng-mouseenter="raised = true" ng-mouseleave="raised = false" class="md-icon-button mdp-clock-deg{{ ::(clock.STEP_DEG * ($index + 1)) }}" ng-repeat="step in clock.steps" ng-click="clock.setTime(step)">{{ step }}</md-button>' +
                        '</div>' +
                    '</md-card>',
        controller: ["$scope", ClockCtrl],
        controllerAs: "clock",
        link: function(scope, element, attrs, ctrl) {
            var pointer = angular.element(element[0].querySelector(".mdp-pointer")),
				timepickerCtrl = scope.$parent.timepicker;
				
            scope.raised = false;

            var onEvent = function(event) {
                var containerCoords = event.currentTarget.getClientRects()[0];
                var x = ((event.currentTarget.offsetWidth / 2) - (event.pageX - containerCoords.left)),
                    y = ((event.pageY - containerCoords.top) - (event.currentTarget.offsetHeight / 2));

                var deg = Math.round((Math.atan2(x, y) * (180 / Math.PI)));
                $timeout(function() {
                    ctrl.setTimeByDeg(deg + 180);
                    if(ctrl.autoSwitch && ["mouseup", "click"].indexOf(event.type) !== -1 && timepickerCtrl) timepickerCtrl.switchView();
                });
            };

            element.on("mousedown", function() {
               element.on("mousemove", onEvent);
            });

            element.on("mouseup", function(e) {
                element.off("mousemove");
            });

            element.on("click", onEvent);
            scope.$on("$destroy", function() {
                element.off("click", onEvent);
                element.off("mousemove", onEvent);

            });
        }
    }
}]);

module.provider("$mdpTimePicker", function() {
    var LABEL_OK = "OK",
        LABEL_CANCEL = "Cancel",
        PARENT_GETTER = function() { return undefined };

    this.setOKButtonLabel = function(label) {
        LABEL_OK = label;
    };

    this.setCancelButtonLabel = function(label) {
        LABEL_CANCEL = label;
    };

    this.setDialogParentGetter = function(fn) {
        PARENT_GETTER = fn;
    };

    this.$get = ["$mdDialog", "$mdpLocale", function($mdDialog, $mdpLocale) {
        return function (time, options) {
            if (!angular.isDate(time)) time = Date.now();
            if (!angular.isObject(options)) options = {};

            var labelOk = options.okLabel || $mdpLocale.time.okLabel || LABEL_OK;
            var labelCancel = options.cancelLabel || $mdpLocale.time.cancelLabel || LABEL_CANCEL;

            return $mdDialog.show({
                controller: ['$scope', '$mdDialog', 'time', 'autoSwitch', 'ampm', '$mdMedia', 'options', TimePickerCtrl],
                controllerAs: 'timepicker',
                clickOutsideToClose: true,
                template: '<md-dialog aria-label="" class="mdp-timepicker" ng-class="{ \'portrait\': !$mdMedia(\'gt-xs\') }">' +
                    '<md-dialog-content layout-gt-xs="row" layout-wrap>' +
                    '<md-toolbar layout-gt-xs="column" layout-xs="row" layout-align="center center" flex class="mdp-timepicker-time md-hue-1 md-primary">' +
                    '<div class="mdp-timepicker-selected-time">' +
                    '<span ng-class="{ \'active\': timepicker.currentView == timepicker.VIEW_HOURS }" ng-click="timepicker.currentView = timepicker.VIEW_HOURS">{{ timepicker.time.format(timepicker.hoursFormat) }}</span>:' +

                    '<span ng-class="{ \'active\': timepicker.currentView == timepicker.VIEW_MINUTES }" ng-click="timepicker.currentView = timepicker.VIEW_MINUTES">{{ timepicker.time.format(timepicker.minutesFormat) }}</span>' +
                    '</div>' +
                    '<div layout="column" ng-show="timepicker.ampm" class="mdp-timepicker-selected-ampm">' +

                    '<span ng-click="timepicker.setAM()" ng-class="{ \'active\': timepicker.time.hour() < 12 }">AM</span>' +
                    '<span ng-click="timepicker.setPM()" ng-class="{ \'active\': timepicker.time.hour() >= 12 }">PM</span>' +
                    '</div>' +

                    '</md-toolbar>' +
                    '<md-content>' +
                    '<div class="mdp-clock-switch-container" ng-switch="timepicker.currentView" layout layout-align="center center">' +
                    '<mdp-clock class="mdp-animation-zoom" ampm="timepicker.ampm" auto-switch="timepicker.autoSwitch" time="timepicker.time" type="hours" ng-switch-when="1"></mdp-clock>' +
                    '<mdp-clock class="mdp-animation-zoom" ampm="timepicker.ampm" auto-switch="timepicker.autoSwitch" time="timepicker.time" type="minutes" ng-switch-when="2"></mdp-clock>' +
                    '</div>' +

                    '<md-dialog-actions layout="row">' +
                    '<span flex></span>' +
                    '<md-button ng-click="timepicker.cancel()" aria-label="' + labelCancel + '">' + labelCancel + '</md-button>' +
                    '<md-button ng-click="timepicker.confirm()" class="md-primary" aria-label="' + labelOk + '">' + labelOk + '</md-button>' +
                    '</md-dialog-actions>' +
                    '</md-content>' +
                    '</md-dialog-content>' +
                    '</md-dialog>',
                targetEvent: options.targetEvent,
                locals: {
                    time: time,
                    autoSwitch: options.autoSwitch,
                    ampm: angular.isDefined(options.ampm) ? options.ampm : $mdpLocale.time.ampm,
                    options: options
                },
                multiple: true,
                parent: PARENT_GETTER()
            });
        };
    }];
});

function compareTimeValidator(scope, value, format, otherTime, comparator) {
    // take only the date part, not the time part
    if (angular.isDate(otherTime)) {
        otherTime = dayjs(otherTime).tz(scope.currentTZ).locale(scope.currentLocale).format(format);
    }
    otherTime = dayjs(otherTime, format, scope.currentLocale, true).tz(scope.currentTZ);
    var date = angular.isDate(value) ? dayjs(value).tz(scope.currentTZ).locale(scope.currentLocale) :  dayjs(value, format, scope.currentLocale, true).tz(scope.currentTZ);

    return !value ||
            angular.isDate(value) ||
            !otherTime.isValid() ||
            comparator(date, otherTime);
}

function minTimeValidator(scope, value, format, minTime) {
    return compareTimeValidator(scope, value, format, minTime, function(t, mt) { return t.isSameOrAfter(mt); });
}

function maxTimeValidator(scope, value, format, maxTime) {
    return compareTimeValidator(scope, value, format, maxTime, function(t, mt) { return t.isSameOrBefore(mt); });
}

module.directive("mdpTimePicker", ["$mdpTimePicker", "$timeout", "$mdpLocale", function($mdpTimePicker, $timeout, $mdpLocale) {
    return  {
        restrict: 'E',
        require: ['ngModel', "^^?form"],
        transclude: true,
        template: function(element, attrs) {
            var noFloat = angular.isDefined(attrs.mdpNoFloat) || $mdpLocale.time.noFloat,
                openOnClick = angular.isDefined(attrs.mdpOpenOnClick) || $mdpLocale.time.openOnClick;

            return '<div layout layout-align="start start">' +
                    '<md-button class="md-icon-button" ng-click="showPicker($event)"' + (angular.isDefined(attrs.mdpDisabled) ? ' ng-disabled="disabled"' : '') + '>' +
                        '<md-icon md-svg-icon="mdp-access-time"></md-icon>' +
                    '</md-button>' +
                    '<md-input-container' + (noFloat ? ' md-no-float' : '') + ' md-is-error="isError()">' +
                        '<input size="5" name="{{ inputName }}" ng-required="required()" type="{{ ::type }}"' + (angular.isDefined(attrs.mdpDisabled) ? ' ng-disabled="disabled"' : '') + ' aria-label="{{placeholder}}" placeholder="{{placeholder}}"' + (openOnClick ? ' ng-click="showPicker($event)" ' : '') + ' />' +
                    '</md-input-container>' +
                '</div>';
        },
        scope: {
            "minTime": "=?mdpMinTime",
            "maxTime": "=?mdpMaxTime",
            "timeFormat": "@mdpFormat",
            "okLabel": "@?mdpOkLabel",
            "cancelLabel": "@?mdpCancelLabel",
            "placeholder": "@mdpPlaceholder",
            "autoSwitch": "=?mdpAutoSwitch",
            "disabled": "=?mdpDisabled",
            "ampm": "=?mdpAmpm",
            "inputName": "@?mdpInputName",
            "clearOnCancel": "=?mdpClearOnCancel",
            "advancedSettings": "=?mdpSettings"
        },
        link: function(scope, element, attrs, controllers, $transclude) {
            var ngModel = controllers[0];
            var form = controllers[1];

            var opts = {
                get minTime() {
                    return scope.minTime || $mdpLocale.time.minTime;
                },
                get maxTime() {
                    return scope.maxTime || $mdpLocale.time.maxTime;
                },
                get clearOnCancel() {
                    return angular.isDefined(scope.clearOnCancel) ? scope.clearOnCancel : $mdpLocale.time.clearOnCancel;
                },
                get settings() {
                    return scope.settings;
                }
            };

            var inputElement = angular.element(element[0].querySelector('input')),
                inputContainer = angular.element(element[0].querySelector('md-input-container')),
                inputContainerCtrl = inputContainer.controller("mdInputContainer");

            $transclude(function(clone) {
                inputContainer.append(clone);
            });

            var messages = angular.element(inputContainer[0].querySelector("[ng-messages]"));
            var settings = {};

            scope.type = scope.timeFormat || $mdpLocale.time.timeFormat ? "text" : "time";
            scope.timeFormat = scope.timeFormat || $mdpLocale.time.timeFormat || "HH:mm";
            scope.autoSwitch = scope.autoSwitch === undefined ? $mdpLocale.time.autoSwitch : scope.autoSwitch;
            scope.model = ngModel;
            scope.settings = settings;

            setCurrentSettingsToScope(scope);

            scope.isError = function() {
                return !!ngModel.$invalid && (!ngModel.$pristine || (form != null && form.$submitted));
            };

            scope.required = function() {
                return !!attrs.required;
            };

            scope.$watch(function() { return ngModel.$error }, function(newValue, oldValue) {
                inputContainerCtrl.setInvalid(!ngModel.$pristine && !!Object.keys(ngModel.$error).length);
            }, true);

            // update input element if model has changed
            ngModel.$formatters.unshift(function(value) {
                var time = angular.isDate(value) && dayjs(value).tz(scope.currentTZ).locale(scope.currentLocale);
                if(time && time.isValid()) {
                    var strVal = time.format(scope.timeFormat);
                    updateInputElement(strVal);
                    return strVal;
                } else {
                    updateInputElement(null);
                    return null;
                }
            });

            ngModel.$validators.format = function(modelValue, viewValue) {
                return !viewValue || angular.isDate(viewValue) || dayjs(viewValue, scope.timeFormat, scope.currentLocale, true).tz(scope.currentTZ).isValid();
            };

            ngModel.$validators.required = function(modelValue, viewValue) {
                return angular.isUndefined(attrs.required) || attrs.required === false || !ngModel.$isEmpty(modelValue) || !ngModel.$isEmpty(viewValue);
            };
            
            ngModel.$validators.minTime = function(modelValue, viewValue) {
                return minTimeValidator(scope, viewValue, scope.timeFormat, opts.minTime);
            };

            ngModel.$validators.maxTime = function(modelValue, viewValue) {
                return maxTimeValidator(scope, viewValue, scope.timeFormat, opts.maxTime);
            };

            ngModel.$parsers.unshift(function(value) {
                var parsed = dayjs(value, scope.timeFormat, scope.currentLocale, true).tz(scope.currentTZ);
                if(parsed.isValid()) {
                    if(angular.isDate(ngModel.$modelValue)) {
                        var originalModel = dayjs(ngModel.$modelValue).tz(scope.currentTZ).locale(scope.currentLocale);
                        originalModel = originalModel.minute(parsed.minute());
                        originalModel = originalModel.hour(parsed.hour());
                        originalModel = originalModel.second(parsed.second());

                        parsed = originalModel;
                    }
                    return parsed.toDate();

                } else
                    return null;
            });

            // update input element value
            function updateInputElement(value) {
                inputElement[0].value = value;
                inputContainerCtrl.setHasValue(!ngModel.$isEmpty(value));
            }

            function updateTime(time, strict) {
                var value = null;
                if (!angular.isDate(time)) {
                    value = dayjs(time, scope.timeFormat, scope.currentLocale, strict).tz(scope.currentTZ);
                } else {
                    value = dayjs(time).tz(scope.currentTZ).locale(scope.currentLocale);
                }
                var strValue = value.format(scope.timeFormat);

                if(value.isValid()) {
                    updateInputElement(strValue);
                    ngModel.$setViewValue(strValue);
                } else {
                    updateInputElement(ngModel.$viewValue);
                }

                if(!ngModel.$pristine &&

                    messages.hasClass("md-auto-hide") &&

                    inputContainer.hasClass("md-input-invalid")) messages.removeClass("md-auto-hide");

                ngModel.$render();
            }

            scope.showPicker = function(ev) {
                $mdpTimePicker(ngModel.$modelValue, {
                    targetEvent: ev,
                    okLabel: scope.okLabel,
                    cancelLabel: scope.cancelLabel,
                    autoSwitch: scope.autoSwitch,
                    ampm: scope.ampm,
                    settings: opts.settings
                }).then(function(time)
                {
                    updateTime(time, true);
                }, function (error) {
                    if (opts.clearOnCancel) {
                        updateTime(null, true);
                    }
                });
            };

            function onInputElementEvents(event) {
                if(event.target.value !== ngModel.$viewValue)
                    updateTime(event.target.value, false);
            }

            inputElement.bind("blur", onInputElementEvents);

            scope.$on("$destroy", function() {
                inputElement.off("reset input blur", onInputElementEvents);
            });

            // revalidate on constraint change
            scope.$watch("minTime + maxTime", function() {
                ngModel.$validate();
            });
        }
    };
}]);

module.directive("mdpTimePicker", ["$mdpTimePicker", "$timeout", function($mdpTimePicker, $timeout) {
    return  {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            "timeFormat": "@mdpFormat",
            "okLabel": "@?mdpOkLabel",
            "cancelLabel": "@?mdpCancelLabel",
            "autoSwitch": "=?mdpAutoSwitch",
            "ampm": "=?mdpAmpm"
        },
        link: function(scope, element, attrs, ngModel, $transclude) {
            scope.format = scope.format || "HH:mm";
            function showPicker(ev) {
                $mdpTimePicker(ngModel.$modelValue, {
                    targetEvent: ev,
                    autoSwitch: scope.autoSwitch,
                    okLabel: scope.okLabel,
                    cancelLabel: scope.cancelLabel,
                    ampm: scope.ampm
                }).then(function(time) {
                    ngModel.$setViewValue(dayjs(time).tz(scope.currentTZ).locale(scope.currentLocale).format(scope.format));
                    ngModel.$render();
                });
            };

            element.on("click", showPicker);

            scope.$on("$destroy", function() {
                element.off("click", showPicker);
            });
        }
    }
}]);

})();