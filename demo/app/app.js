/**
 * Created by Robin Thoni on 6/21/17.
 */

import "angular-material/angular-material.css";
import 'md-pickers/dist/mdPickers.css';

import angular from 'angular';
import ngMaterial from 'angular-material';

import ngMessages from "angular-messages"
import moment from "moment";
import "moment/locale/de-ch";
import "moment/locale/fr-ch";
import "moment/locale/it-ch";
import mdPickers from 'md-pickers';
import demoService from "./demoService";

window.moment = moment;

export default angular.module("demo", [
    ngMaterial,
    ngMessages,
    mdPickers
])
    .config(['$mdThemingProvider', function ($mdThemingProvider) {
        $mdThemingProvider.theme('dark').dark();
    }])
    .service("demoService", demoService)

    .run(['$location', '$mdpLocale', function ($location, $mdpLocale) {
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

Date.prototype.addDays = function (days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}
