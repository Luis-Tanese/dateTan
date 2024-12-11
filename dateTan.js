const locales = require("./locales.json");
const holidays = require("./holidays.json");

const localeCache = {};

/**
 * Fetch locale data with caching and fallback support.
 * @param {string|string[]} locale - The locale identifier(s) (e.g., "en-us", ["pt-br", "en-us"]).
 * @returns {object} - The locale data object.
 */
const getLocaleData = (locale) => {
    const localesToCheck = Array.isArray(locale) ? locale : [locale];
    for (const loc of localesToCheck) {
        const normalizedLocale = loc.toLowerCase();
        if (localeCache[normalizedLocale]) return localeCache[normalizedLocale];
        if (locales[normalizedLocale]) {
            localeCache[normalizedLocale] = locales[normalizedLocale];
            return locales[normalizedLocale];
        }
    }
    console.warn(
        `None of the locales ${JSON.stringify(
            localesToCheck
        )} found. Falling back to 'en-us'.`
    );
    return locales["en-us"];
};

/**
 * Extract various date parts for formatting.
 * Supports week numbers, ordinal dates, and more.
 * @param {Date} date - The input date.
 * @param {object} localeData - The locale data for formatting.
 * @returns {object} - An object mapping tokens to formatted values.
 */
const getDateParts = (date, localeData) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const dayOfYear =
        Math.floor((date - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
    const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay()) / 7);
    const hours24 = date.getHours();
    const hours12 = hours24 % 12 || 12;
    const ampm = hours24 >= 12 ? "PM" : "AM";

    const getOrdinalSuffix = (n) =>
        ["th", "st", "nd", "rd"][((n % 100) - 20) % 10] || "th";

    const getTimeZoneOffset = () => {
        const offset = -date.getTimezoneOffset();
        const sign = offset >= 0 ? "+" : "-";
        const absOffset = Math.abs(offset);
        const hours = String(Math.floor(absOffset / 60)).padStart(2, "0");
        const minutes = String(absOffset % 60).padStart(2, "0");
        return `${sign}${hours}:${minutes}`;
    };

    const getTimeZoneName = () => {
        const options = { timeZoneName: "short" };
        return (
            new Intl.DateTimeFormat("en-US", options)
                .formatToParts(date)
                .find((part) => part.type === "timeZoneName")?.value || "UTC"
        );
    };

    const isLeapYear = (year) =>
        (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

    const getHoliday = () => {
        const monthDay = `${String(date.getMonth() + 1).padStart(
            2,
            "0"
        )}-${String(date.getDate()).padStart(2, "0")}`;
        const holiday = holidays[monthDay];
        if (Array.isArray(holiday)) {
            return holiday.join(", ");
        }
        return holiday || "No holiday today!";
    };

    const tokens = {
        DDDD: localeData.days[date.getDay()],
        DDD: localeData.shortDays[date.getDay()],
        DD: String(date.getDate()).padStart(2, "0"),
        Do: `${date.getDate()}${getOrdinalSuffix(date.getDate())}`,
        MMMM: localeData.months[date.getMonth()],
        MMM: localeData.shortMonths[date.getMonth()],
        MM: String(date.getMonth() + 1).padStart(2, "0"),
        YYYY: date.getFullYear(),
        WW: String(weekNumber).padStart(2, "0"),
        hh: String(hours12).padStart(2, "0"),
        HH: String(hours24).padStart(2, "0"),
        mm: String(date.getMinutes()).padStart(2, "0"),
        ss: String(date.getSeconds()).padStart(2, "0"),
        ms: String(date.getMilliseconds()).padStart(3, "0"),
        tt: ampm,
        ISO: date.toISOString(),
        Z: getTimeZoneOffset(),
        TZ: getTimeZoneName(),
        R: getRelativeTime(date),
        LY: isLeapYear(date.getFullYear()) ? "Leap Year" : "",
        H: getHoliday(),
    };

    return tokens;
};

/**
 * Parse a date based on the provided format.
 * @param {string} dateString - The date string to parse.
 * @param {string} formatString - The format string (e.g., "MM-DD-YYYY")
 * @returns {Date} - The parsed Date object.
 */
const dateTanParse = (dateString, formatString) => {
    const tokenReg =
        /DDDD|DDD|DD|Do|MMMM|MMM|MM|YYYY|WW|hh|HH|mm|ss|ms|tt|Z|TZ/g;
    const formatTokens = formatString.match(tokenReg);
    const valueReg = formatString.replace(tokenReg, "([\\w\\s\\-:]+)");
    const dateValues = new RegExp(`^${valueReg}$`).exec(dateString);

    if (!dateValues) throw new Error("Date string does not match format!");

    const dateParts = {};
    formatTokens.forEach((token, i) => {
        dateParts[token] = dateValues[i + 1];
    });

    return new Date(
        Date.UTC(
            dateParts.YYYY || 1970,
            (dateParts.MM || 1) - 1,
            dateParts.DD || 1,
            dateParts.HH || 0,
            dateParts.mm || 0,
            dateParts.ss || 0
        )
    );
};

/**
 *Get a relative time string (e.g., "2 days ago", "in 3 hours").
 * @param {Date} date - The input date.
 * @param {Date} [now = new Date()] - The reference date (defaults to the current date).
 * @returns {string} - The relative time string.
 */
const getRelativeTime = (date, now = new Date()) => {
    const diffMs = date - now;
    const diffSeconds = Math.round(diffMs / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    if (Math.abs(diffDays) > 0) {
        return diffDays > 0
            ? `in ${diffDays} days`
            : `${Math.abs(diffDays)} days ago`;
    } else if (Math.abs(diffHours) > 0) {
        return diffHours > 0
            ? `in ${diffHours} hours`
            : `${Math.abs(diffHours)} hours ago`;
    } else if (Math.abs(diffMinutes) > 0) {
        return diffMinutes > 0
            ? `in ${diffMinutes} minutes`
            : `${Math.abs(diffMinutes)} minutes ago`;
    } else {
        return diffSeconds > 0
            ? `in ${diffSeconds} seconds`
            : `${Math.abs(diffSeconds)} seconds ago`;
    }
};

/**
 * Format the input date based on the format string and locale.
 * Supports chaining multiple formats and default formats.
 * @param {Date|string} inputDate - The input date or date string.
 * @param {string|string[]} formatString - A format string or an array of format strings for chaining.
 * @param {string|string[]} locale - The locale identifier(s) (e.g., "en-us", ["pt-br", "en-us"]).
 * @returns {string|string[]} - The formatted date string or an array of formatted strings.
 */
const dateTan = (inputDate, formatString = "short", locale = "en-us") => {
    if (!inputDate) {
        throw new Error("Invalid Date Provided!");
    }

    const date =
        typeof inputDate === "string" ? new Date(inputDate) : inputDate;

    if (isNaN(date.getTime())) {
        throw new Error("Invalid Date Provided!");
    }

    const localeData = getLocaleData(locale);
    const dateParts = getDateParts(date, localeData);

    const tokens = Object.keys(dateParts).sort((a, b) => b.length - a.length);
    const regex = new RegExp(tokens.join("|"), "g");

    const defaultFormats = {
        short: "MM/DD/YYYY",
        long: "MMMM DD, YYYY",
        full: "DDDD, MMMM DD, YYYY, HH:mm:ss TZ",
        iso: "ISO",
        relative: "R",
    };

    if (Array.isArray(formatString)) {
        return formatString.map((format) => {
            const resolvedFormat = defaultFormats[format] || format;
            return resolvedFormat.replace(
                regex,
                (match) => dateParts[match] || match
            );
        });
    }

    const actualFormat = defaultFormats[formatString] || formatString;

    return actualFormat.replace(regex, (match) => dateParts[match] || match);
};

module.exports = { dateTan, dateTanParse };
