/**
 * Created by Robin Thoni on 6/21/17.
 */

import "angular-material/angular-material.css";
import 'md-pickers/dist/mdPickers.css';

import angular from 'angular';
import ngMaterial from 'angular-material';
import ngMessages from "angular-messages";
import demo from "./demo";

import dayjs from "dayjs";
import * as locale_de from 'dayjs/locale/de';
import * as locale_dech from 'dayjs/locale/de-ch';
import * as locale_frch from 'dayjs/locale/fr-ch';
import * as locale_itch from 'dayjs/locale/it-ch';


export default angular.module("demoApp", [
    ngMaterial,
    ngMessages,
    demo
])
    .factory('demoAppService', DemoAppService)
    .name;

Date.prototype.addDays = function (days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}

function DemoAppService($window) {
    $window.dayjs = dayjs;
    $window.dayjs.locale(locale_de);
    $window.dayjs.locale(locale_dech);
    $window.dayjs.locale(locale_frch);
    $window.dayjs.locale(locale_itch);
    $window.dayjs.locale('en');
    return {};
}
