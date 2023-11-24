// Should already be required, here for clarity
require('angular');

// Load Angular and dependent libs
require('angular-animate');
require('angular-aria');

// Now load Angular Material
require('angular-material');

require ('./dist/mdPickers');

// Dayjs
const dayjs = require('dayjs')
var localeData = require('dayjs/plugin/localeData');
var localizedFormat = require('dayjs/plugin/localizedFormat');
var customParseFormat = require('dayjs/plugin/customParseFormat');
var isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
var isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
dayjs.extend(localeData);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

module.exports = 'mdPickers';