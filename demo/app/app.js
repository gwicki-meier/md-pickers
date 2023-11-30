/**
 * Created by Robin Thoni on 6/21/17.
 */

import "angular-material/angular-material.css";
import 'md-pickers/dist/mdPickers.css';

import angular from 'angular';
import ngMaterial from 'angular-material';
import ngMessages from "angular-messages";
import demo from "./demo";

import moment from "moment-timezone/builds/moment-timezone-with-data-10-year-range";
import "../locale/de";
import "../locale/de-ch";
import "../locale/fr-ch";
import "../locale/it-ch";
moment.locale("en");


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
    $window.moment = moment;
    return {};
}
