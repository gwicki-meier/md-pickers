// This Plugin extends dayjs with luxon object
const { DateTime } = require("luxon");

export default (option, dayjsClass, dayjsFactory) => {
    const proto = dayjsClass.prototype
    let dateTimeObject;
    let overrideTimezone;
    let timezone;
    let dayjsObject;
    let settings;

    proto.overrideTimezone = function(value)  {
        overrideTimezone = value
        this.overrideTimezone = overrideTimezone
        return this
    }

    proto.dateTimeObject = function(settings) {
        [dayjsObject, dateTimeObject] = toDayjsObject(dayjsFactory, this, settings);
        timezone = dateTimeObject.zoneName;
        overrideTimezone = settings.overrideTimezone;
        return dayjsFactory(dayjsObject)
    }

    proto.dateTimeToDayjs = function(withTimezone) {
        let locale = dateTimeObject.locale;
        timezone = dateTimeObject.zoneName
        if (withTimezone) {
            return dayjsFactory(dateTimeObject).locale(locale).tz(timezone, true);
        } else {
            return dayjsFactory(dateTimeObject).locale(locale);
        }

    }

    proto.getTimezone = function() {return timezone};



    proto.getDateTimeObject = function () {return dateTimeObject};

}


function toDayjsObject(dayjsFactory, dayjsObject, opts) {

    let dateTimeObject = DateTime.now();

    let timezone = opts.timezone;
    let timezoneOverride = opts.timezoneOverride || false;
    let keepTime = opts.keepTime || false;
    let localTime = opts.localTime || false;
    let locale = opts.locale;
    let dateFormat = opts.dateFormat;
    let timeFormat = opts.timeFormat;
    let rawDate = opts.rawDate;
    let rawTime = opts.rawTime;


    if (opts.dateFormat === "L" || opts.dateFormat === "l") {
        dateFormat = "D";
    }

    if (opts.timeFormat === "LT") {
        timeFormat = "T";
    }

    function addColon(time) {
        if ((dayjsFactory.Ls[dayjsObject.locale()]) !== null && (dayjsFactory.Ls[dayjsObject.locale()]) !== undefined) {
            if (dayjsFactory.Ls[dayjsObject.locale()].formats.LT === "HH:mm") {
                if (time.length === 4 && time.split(":").length === 1) {
                    time = time.slice(0, 2) + ":" + time.slice(2, 4);
                }
            }
        }
        return time;
    }


    if (timezoneOverride) {
        if (rawDate) {
            dateTimeObject = DateTime.fromFormat(addColon(rawDate), dateFormat, {zone: timezone, locale: locale});
            dayjsObject = dayjsFactory(dateTimeObject).tz(dateTimeObject.zoneName, true).locale(dateTimeObject.locale);
        }
        else if (rawTime) {
            dateTimeObject = DateTime.fromFormat(addColon(rawTime), timeFormat, {zone: timezone, locale: locale});
            dayjsObject = dayjsFactory(dateTimeObject).tz(dateTimeObject.zoneName, true).locale(dateTimeObject.locale);
        }
        else if (keepTime) {
            // if (dayjsObject.isUTC()) {
            //     dateTimeObject = DateTime.fromISO(dayjsObject.toISOString(), {zone: timezone, locale: locale});
            // } else {
            //
            // }
            dateTimeObject = DateTime.fromISO(dayjsObject.toISOString(), {zone: timezone, locale: locale});
        }
        else if (localTime) {
            dateTimeObject = DateTime.fromISO(dayjsObject.toISOString(), {zone: timezone, locale: locale});
            dayjsObject = dayjsFactory(dateTimeObject).locale(dateTimeObject.locale);
        }
        else if (dayjsObject) {
            dateTimeObject = DateTime.fromISO(dayjsObject.toISOString(), {zone: timezone, locale: locale});
            dayjsObject = dayjsFactory(dateTimeObject).tz(dateTimeObject.zoneName, true).locale(dateTimeObject.locale);
        }

    } else {
        if (rawDate) {
            dateTimeObject = DateTime.fromFormat(rawDate, dateFormat, {zone: DateTime.now().zoneName, locale: locale});
            dayjsObject = dayjsFactory(dateTimeObject).tz(dateTimeObject.zoneName).locale(dateTimeObject.locale);
        } else if (rawTime) {
            dateTimeObject = DateTime.fromFormat(rawTime, timeFormat, {zone: DateTime.now().zoneName, locale: locale});
            dayjsObject = dayjsFactory(dateTimeObject).tz(dateTimeObject.zoneName).locale(dateTimeObject.locale);
        } else if (dayjsObject) {
            dateTimeObject = DateTime.fromISO(dayjsObject.toISOString(), {zone: DateTime.now().zoneName, locale: locale});
            dayjsObject = dayjsFactory(dateTimeObject).tz(dateTimeObject.zoneName).locale(dateTimeObject.locale);
        }
    }






    return [dayjsObject, dateTimeObject];
}



