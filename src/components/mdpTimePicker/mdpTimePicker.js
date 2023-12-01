/* global moment, angular */

function TimePickerCtrl($scope, $mdDialog, time, autoSwitch, ampm, $mdMedia, options) {
    var self = this;

    this.VIEW_HOURS = 1;
    this.VIEW_MINUTES = 2;
    this.currentView = this.VIEW_HOURS;
    this.time = extendedMoment({attrs: [time], disableTimezone: options.settings.disableTimezone});
    this.time.setLocale(options.settings.currentLocale);
    this.ampm = !!ampm;

    this.hoursFormat = self.ampm ? "h" : "H";
    this.minutesFormat = "mm";

    this.clockHours = parseInt(this.time.moment.format(this.hoursFormat));
    this.clockMinutes = parseInt(this.time.moment.format(this.minutesFormat));

    $scope.$mdMedia = $mdMedia;

    this.switchView = function() {
        self.currentView = self.currentView == self.VIEW_HOURS ? self.VIEW_MINUTES : self.VIEW_HOURS;
    };

    this.setAM = function() {
        if(self.time.moment.hours() >= 12)
            self.time.moment.hour(self.time.moment.hour() - 12);
    };

    this.setPM = function() {
        if(self.time.moment.hours() < 12)
            self.time.moment.hour(self.time.moment.hour() + 12);
    };

    this.cancel = function() {
        $mdDialog.cancel();
    };

    this.confirm = function() {
        $mdDialog.hide(this.time.moment.toDate());
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
                self.selected = self.time.moment.hours() || 0;
                if(self.ampm && self.selected > 12) self.selected -= 12;

                break;
            case TYPE_MINUTES:
                for(var i = 5; i <= 55; i+=5)
                    self.steps.push(i);
                self.steps.push(0);
                self.selected = self.time.moment.minutes() || 0;

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
                this.time.moment.hours(time);
                break;
            case TYPE_MINUTES:
                if(time > 59) time -= 60;
                this.time.moment.minutes(time);
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
            options.settings = options.settings || {disableTimezone: false, currentLocale: "en"};

            if (!angular.isObject(options)) options = {};
            if (!angular.isDate(time)) {
                time = newDate(options.settings);
            }

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
                    '<span ng-class="{ \'active\': timepicker.currentView == timepicker.VIEW_HOURS }" ng-click="timepicker.currentView = timepicker.VIEW_HOURS">{{ timepicker.time.moment.format(timepicker.hoursFormat) }}</span>:' +

                    '<span ng-class="{ \'active\': timepicker.currentView == timepicker.VIEW_MINUTES }" ng-click="timepicker.currentView = timepicker.VIEW_MINUTES">{{ timepicker.time.moment.format(timepicker.minutesFormat) }}</span>' +
                    '</div>' +
                    '<div layout="column" ng-show="timepicker.ampm" class="mdp-timepicker-selected-ampm">' +

                    '<span ng-click="timepicker.setAM()" ng-class="{ \'active\': timepicker.time.moment.hours() < 12 }">AM</span>' +
                    '<span ng-click="timepicker.setPM()" ng-class="{ \'active\': timepicker.time.moment.hours() >= 12 }">PM</span>' +
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
                    ampm: angular.isDefined(options.ampm) ? options.ampm : $mdpLocale.time.ampm, options: options
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
        otherTime = extendedMoment({attrs: [otherTime], disableTimezone: scope.settings.disableTimezone}).moment.format(format);
    }
    otherTime = extendedMoment({attrs: [otherTime, format, true], disableTimezone: scope.settings.disableTimezone}).moment;
    var date = angular.isDate(value) ? extendedMoment({attrs: [value], disableTimezone: scope.settings.disableTimezone}).moment :  extendedMoment({attrs: [value, format, true], disableTimezone: scope.settings.disableTimezone}).moment;

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
            "clearOnCancel": "=?mdpClearOnCancel"
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

            scope.type = scope.timeFormat || $mdpLocale.time.timeFormat ? "text" : "time";
            scope.timeFormat = scope.timeFormat || $mdpLocale.time.timeFormat || "HH:mm";
            scope.autoSwitch = scope.autoSwitch === undefined ? $mdpLocale.time.autoSwitch : scope.autoSwitch;
            scope.model = ngModel;
            scope.settings =  {};

            setCurrentSettingsToScope(scope, $mdpLocale.settings);

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
                var time = angular.isDate(value) && extendedMoment({attrs: [value], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale).moment;
                if(time && time.isValid()) {
                    var strVal = time.format(scope.timeFormat);
                    updateInputElement(strVal);
                    return null;
                } else {
                    updateInputElement(null);
                    return null;
                }
            });

            ngModel.$validators.format = function(modelValue, viewValue) {
                return !viewValue || angular.isDate(viewValue) || extendedMoment({attrs: [viewValue, scope.timeFormat], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale).moment.isValid();
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
                var parsed = extendedMoment({attrs: [value], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale).moment;

                if(parsed.isValid()) {
                    if(angular.isDate(ngModel.$modelValue)) {
                        var originalModel = extendedMoment({attrs: [ngModel.$modelValue], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale).moment;
                        originalModel.minutes(parsed.minutes());
                        originalModel.hours(parsed.hours());
                        originalModel.seconds(parsed.seconds());

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

            function updateTime(time, fromEvent) {
                var value;
                var ok = true;
                if (fromEvent) {
                    if (time.length === 4 && time.split(":").length === 1) {
                        time = time.slice(0, 2) + ":" + time.slice(2, 4);
                    }
                    if (time === "") {
                        var previousValue = ngModel.$modelValue;
                        ok = false;
                        if (previousValue === null) {
                            previousValue = newDate(scope.settings)
                            // No Time or Date was set before, so we set the current time
                            ok = true;
                        }
                        value = extendedMoment({attrs: [previousValue], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale).moment;

                    } else {
                        value = extendedMoment({attrs: [], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale).moment;
                        value.minutes(time.split(":")[1]);
                        value.hours(time.split(":")[0]);
                        if (!value.isValid()) {
                            value = extendedMoment({attrs: [ngModel.$modelValue], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale).moment;
                            ok = false;
                        }
                    }
                } else {
                    if (angular.isDate(time)) {
                        value = extendedMoment({attrs: [time, null, true], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale).moment;
                    } else {
                        value = extendedMoment({attrs: [time, scope.timeFormat], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale).moment
                    }
                }

                value.locale(scope.settings.currentLocale);
                var strValue = value.format(scope.timeFormat);

                if(value.isValid() && ok) {
                    updateInputElement(strValue);
                    ngModel.$setViewValue(value);
                } else {
                    updateInputElement(strValue);
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
                }).then(function(time){
                    updateTime(time);
                }, function (error) {
                    if (opts.clearOnCancel) {
                        updateTime(null);
                    }
                });
            };

            function onInputElementEvents(event) {
                if(event.target.value !== ngModel.$viewValue)
                    updateTime(event.target.value, true);
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
                    ngModel.$setViewValue(extendedMoment({attrs: [time], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale).moment.format(scope.format));
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
