/* global dayjs, angular */

function DatePickerCtrl($scope, $mdDialog, $mdMedia, $timeout, currentDate, options) {
    var self = this;

    this.date = extendedMoment({attrs: [currentDate], disableTimezone: options.settings.disableTimezone});
    this.date.setLocale(options.settings.currentLocale);
    this.minDate = options.minDate && extendedMoment({attrs: [options.minDate], disableTimezone: options.settings.disableTimezone}).setLocale(options.settings.currentLocale)
        .moment.isValid() ? extendedMoment({attrs: [options.minDate], disableTimezone: options.settings.disableTimezone}).setLocale(options.settings.currentLocale).moment : null;
    this.maxDate = options.maxDate && extendedMoment({attrs: [options.maxDate], disableTimezone: options.settings.disableTimezone}).setLocale(options.settings.currentLocale)
        .moment.isValid() ? extendedMoment({attrs: [options.maxDate], disableTimezone: options.settings.disableTimezone}).setLocale(options.settings.currentLocale).moment : null;
    this.displayFormat = options.displayFormat || "ddd, MMM DD";
    this.dateFilter = angular.isFunction(options.dateFilter) ? options.dateFilter : null;
    this.selectingYear = false;

    // validate min and max date
    if (this.minDate && this.maxDate) {
        if (this.maxDate.isBefore(this.minDate)) {
            this.maxDate = extendedMoment({attrs: [this.minDate], disableTimezone: options.settings.disableTimezone}).setLocale(options.settings.currentLocale).moment.add(1, 'days');
        }
    }

    if (this.date.moment) {
        // check min date
        if (this.minDate && this.date.moment.isBefore(this.minDate)) {
            this.date.moment = extendedMoment({attrs: [this.minDate], disableTimezone: options.settings.disableTimezone}).setLocale(options.settings.currentLocale).moment;
        }

        // check max date
        if (this.maxDate && this.date.moment.isAfter(this.maxDate)) {
            this.date.moment = extendedMoment({attrs: [this.maxDate], disableTimezone: options.settings.disableTimezone}).setLocale(options.settings.currentLocale).moment;
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
    $scope.year = this.date.moment.year();

    this.selectYear = function(year) {
        self.date.moment.year(year);
        $scope.year = year;
        self.selectingYear = false;
        self.animate();
    };

    this.showYear = function() {

        self.yearTopIndex = (self.date.moment.year() - self.yearItems.START) + Math.floor(self.yearItems.PAGE_SIZE / 2);
        self.yearItems.currentIndex_ = (self.date.moment.year() - self.yearItems.START) + 1;
        self.selectingYear = true;
    };

    this.showCalendar = function() {
        self.selectingYear = false;
    };

    this.cancel = function() {
        $mdDialog.cancel();
    };

    this.confirm = function() {
        var date = this.date.moment;

        if (this.minDate && this.date.moment.isBefore(this.minDate)) {
            date = extendedMoment({attrs: [this.minDate], disableTimezone: options.settings.disableTimezone}).setLocale(options.settings.currentLocale).moment;
        }

        if (this.maxDate && this.date.moment.isAfter(this.maxDate)) {
            date = extendedMoment({attrs: [this.maxDate], disableTimezone: options.settings.disableTimezone}).setLocale(options.settings.currentLocale).moment;;
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
            options.displayFormat = options.displayFormat || $mdpLocale.date.displayFormat || DISPLAY_FORMAT;
            options.settings = options.settings || {disableTimezone: false, currentLocale: "en"};

            if (!angular.isObject(options)) options = {};
            if (!angular.isDate(currentDate)) {
                currentDate = newDate(options.settings);
            }

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
                    '<span class="mdp-datepicker-year" ng-click="datepicker.showYear()" ng-class="{ \'active\': datepicker.selectingYear }">{{ datepicker.date.moment.format(\'YYYY\') }}</span>' +
                    '<span class="mdp-datepicker-date" ng-click="datepicker.showCalendar()" ng-class="{ \'active\': !datepicker.selectingYear }">{{ datepicker.date.moment.format(datepicker.displayFormat) }}</span> ' +
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
        self.localeData = self.date.moment.localeData();
        self.daysInMonth = [];
        self.dow = self.localeData.firstDayOfWeek();
        self.weekDays = [].concat(
            self.localeData.weekdaysMin().slice(self.dow),
            self.localeData.weekdaysMin().slice(0, self.dow)
        );
        $scope.$watch(function () {
            return self.date.moment.unix()
        }, function (newValue, oldValue) {
            if (newValue && newValue !== oldValue)
                self.updateDaysInMonth();
        });
        self.updateDaysInMonth();
    };

    this.getDaysInMonth = function() {
        var days = self.date.moment.daysInMonth(),
            firstDay = extendedMoment({attrs: [self.date.moment], disableTimezone: self.date.disableTimezone}).setLocale(self.date.currentLocale).moment.date(1).day() - this.dow;

        if(firstDay < 0) firstDay = this.weekDays.length - 1;

        var arr = [];
        for(var i = 1; i <= (firstDay + days); i++) {
            var day = null;
            if(i > firstDay) {
                day =  {
                    value: (i - firstDay),
                    enabled: self.isDayEnabled(extendedMoment({attrs: [self.date.moment], disableTimezone: self.date.disableTimezone}).setLocale(self.date.currentLocale).moment.date(i - firstDay).toDate())
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
        self.date.moment.date(dom);
    };

    this.nextMonth = function() {
        self.date.moment.add(1, 'months');
    };

    this.prevMonth = function() {
        self.date.moment.subtract(1, 'months');
    };

    this.updateDaysInMonth = function() {
        self.daysInMonth = self.getDaysInMonth();
    };

    $scope.$watch(function() { return  self.date.moment.unix() }, function(newValue, oldValue) {
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
                        '<div class="mdp-calendar-monthyear" ng-show="!calendar.animating">{{ calendar.date.moment.format("MMMM YYYY") }}</div>' +
                        '<md-button aria-label="next month" class="md-icon-button" ng-click="calendar.nextMonth()"><md-icon md-svg-icon="mdp-chevron-right"></md-icon></md-button>' +
                    '</div>' +
                    '<div layout="row" layout-align="space-around center" class="mdp-calendar-week-days" ng-show="!calendar.animating">' +
                        '<div layout layout-align="center center" ng-repeat="d in calendar.weekDays track by $index">{{ d }}</div>' +
                    '</div>' +
                    '<div layout="row" layout-align="start center" layout-wrap class="mdp-calendar-days" ng-class="{ \'mdp-animate-next\': calendar.animating }" ng-show="!calendar.animating" md-swipe-left="calendar.nextMonth()" md-swipe-right="calendar.prevMonth()">' +
                        '<div layout layout-align="center center" ng-repeat-start="day in calendar.daysInMonth track by $index" ng-class="{ \'mdp-day-placeholder\': !day }">' +
                            '<md-button class="md-icon-button" aria-label="Select day" ng-mouseenter="raised = true" ng-mouseleave="raised = false" ng-if="day" ng-class="{ \'md-accent\': calendar.date.moment.date() == day.value, \'md-raised\': raised || calendar.date.moment.date() == day.value }" ng-dblclick="datepicker.confirm()" ng-click="calendar.selectDate(day.value)" ng-disabled="!day.enabled">{{ day.value }}</md-button>' +
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

            scope.$watch(function() { return  ctrl.date.moment.format("YYYYMM") }, function(newValue, oldValue) {
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
    return !value || angular.isDate(value) || extendedMoment({attrs: [value, format], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale).moment.isValid();
}

function compareDateValidator(scope, value, format, otherDate, comparator) {
    // take only the date part, not the time part
    if (angular.isDate(otherDate)) {
        otherDate = extendedMoment({attrs: [otherDate], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale).moment.format(format);
    }
    otherDate = extendedMoment({attrs: [otherDate, format, scope.settings.currentLocale, true], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale).moment;
    var date = extendedMoment({attrs: [value], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale)
        .moment ? extendedMoment({attrs: [value], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale)
        .moment :  extendedMoment({attrs: [value, format, true], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale).moment;

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
    var date = angular.isDate(value) ? extendedMoment({attrs: [value], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale)
        .moment :  extendedMoment({attrs: [value, format, true], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale).moment;

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
            "clearOnCancel": "=?mdpClearOnCancel"
        },
        link: {
            pre: function(scope, element, attrs, controllers, $transclude) {

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

                scope.type = scope.dateFormat || $mdpLocale.date.dateFormat ? "text" : "date";
                scope.dateFormat = scope.dateFormat || $mdpLocale.date.dateFormat || "YYYY-MM-DD";
                scope.model = ngModel;
                scope.settings = {};

                setCurrentSettingsToScope(scope, $mdpLocale.settings);

                scope.isError = function() {
                    return !!ngModel.$invalid && (!ngModel.$pristine || (form != null && form.$submitted));
                };

                scope.required = function() {
                    return !!attrs.required;
                };


                // update input element if model has changed
                ngModel.$formatters.unshift(function(value) {
                    var date = angular.isDate(value) && extendedMoment({attrs: [value], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale).moment;
                    if(date && date.isValid()) {

                        var strVal = date.format(scope.dateFormat);
                        updateInputElement(strVal);
                        return null;
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
                    var parsed = extendedMoment({attrs: [value], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale).moment;
                    if(parsed.isValid()) {
                        if(angular.isDate(ngModel.$modelValue)) {
                            var originalModel = extendedMoment({attrs: [ngModel.$modelValue], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale).moment;
                            originalModel.year(parsed.year());
                            originalModel.month(parsed.month());
                            originalModel.date(parsed.date());

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

                function updateDate(date, fromEvent) {
                    var value;
                    var ok = true;
                    if (fromEvent) {
                        if (date === "") {
                            var previousValue = ngModel.$modelValue;
                            ok = false;
                            if (previousValue === null) {
                                previousValue = newDate(scope.settings)
                                // No Time or Date was set before, so we set the current date
                                ok = true;
                            }
                            value = extendedMoment({attrs: [previousValue], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale).moment;
                        } else {
                            value = extendedMoment({
                                attrs: [date, scope.dateFormat, scope.settings.currentLocale, true],
                                disableTimezone: scope.settings.disableTimezone
                            }).setLocale(scope.settings.currentLocale).moment;
                            if (!value.isValid() && (scope.dateFormat === "L")) {
                                value = extendedMoment({
                                    attrs: [date, "l", scope.settings.currentLocale, true],
                                    disableTimezone: scope.settings.disableTimezone
                                }).setLocale(scope.settings.currentLocale).moment;
                            }
                            value.minutes(0);
                            value.hours(0)
                        }
                    } else {
                        if (angular.isDate(date)) {
                            value = extendedMoment({attrs: [date, null, true], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale).moment;
                        } else {
                            value = extendedMoment({attrs: [date, scope.dateFormat, true], disableTimezone: scope.settings.disableTimezone}).setLocale(scope.settings.currentLocale).moment;
                        }
                    }

                    value.locale(scope.settings.currentLocale);
                    var strValue = value.format(scope.dateFormat);

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
                    $mdpDatePicker(ngModel.$modelValue, {
                        minDate: opts.minDate,
                        maxDate: opts.maxDate,
                        dateFilter: opts.dateFilter,
                        okLabel: scope.okLabel,
                        cancelLabel: scope.cancelLabel,
                        targetEvent: ev,
                        settings: opts.settings
                    }).then(function(time) {
                        updateDate(time);
                    }, function (error) {
                        if (opts.clearOnCancel) {
                            updateDate(null);
                        }
                    });
                };

                function onInputElementEvents(event) {
                    if(event.target.value !== ngModel.$viewValue)
                        updateDate(event.target.value, true);
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