# dateTan.js

`dateTan` is a  customizable date formatting utility for Node.js. It supports localization, relative times, ISO strings, chained formatting, and a lot more.

---

## Features

- **User-friendly tokens** for date formatting.
- **Localization support** with configurable locales.
- **Relative time formatting** (e.g., "2 days ago", "in 3 hours" when compared to a specific date).
- **Time zone support** with ISO strings and time zone abbreviations.
- **Chained formatting** for generating multiple formats in one call.
- **Default formats** for common use cases like `short`, `long`, `full`, `iso`, and `relative`.
- **Holiday detection** to check for special dates.

---

## Installation

Make sure to install any required dependencies and load the `dateTan` module in your project.

```bash
npm install dateTan
```

---

## Tokens

| Token  | Description                       | Example Output        |
|--------|-----------------------------------|-----------------------|
| `DD`   | Day of the month (2 digits)       | `09`                  |
| `DDD`  | Short day name                    | `Mon`                 |
| `DDDD` | Full day name                     | `Monday`              |
| `Do`   | Ordinal day                       | `9th`                 |
| `MM`   | Month (2 digits)                  | `12`                  |
| `MMM`  | Short month name                  | `Dec`                 |
| `MMMM` | Full month name                   | `December`            |
| `YYYY` | Full year                         | `2024`                |
| `WW`   | Week of the year (2 digits)       | `50`                  |
| `hh`   | Hour (12-hour clock)              | `01`                  |
| `HH`   | Hour (24-hour clock)              | `13`                  |
| `mm`   | Minutes                           | `25`                  |
| `ss`   | Seconds                           | `51`                  |
| `ms`   | Milliseconds (3 digits)           | `131`                 |
| `tt`   | AM/PM                             | `AM`                  |
| `ISO`  | ISO 8601 date string              | `2024-12-09T01:25:51Z`|
| `R`    | Relative time                     | `2 days ago`          |
| `H`    | Holiday name                      | `Christmas`           |
| `Z`    | Time zone offset                  | `+00:00`              |
| `TZ`   | Time zone name                    | `UTC`                 |

---

## Contribution

If you would like to contribute on the locales.json or holidays.json, feel free to open a pull request on [github]() with the additions or whole file. That would be appreciated 🤝!

---

## Usage

### Import the Module

```javascript
const { dateTan, dateTanParse } = require("./dateTan");
```

### Basic Usage

```javascript
const formattedDate = dateTan(new Date(), "DDDD, MMMM DD, YYYY", "en-us");
console.log(formattedDate); // Monday, December 09, 2024
```

### Relative Time Formatting

```javascript
const somePastDate = new Date(Date.now() - 48 * 60 * 60 * 1000); // 2 days ago
const relativeTime = dateTan(somePastDate, "R", "en-us");
console.log(relativeTime); // 2 days ago
```

---

## Examples

### Example 1: Default Formats

```javascript
const date = new Date();
console.log(dateTan(date, "short", "en-us")); // 12/09/2024
console.log(dateTan(date, "long", "en-us")); // December 09, 2024
console.log(dateTan(date, "full", "en-us")); // Monday, December 09, 2024, 13:25:51 UTC
console.log(dateTan(date, "relative", "en-us")); // in 0 seconds (depending on the time passed)
```

### Example 2: Chained Formatting

```javascript
const date = new Date();
const formats = ["short", "long", "full"];
console.log(dateTan(date, formats, "en-us"));
// Output: ["12/09/2024", "December 09, 2024", "Monday, December 09, 2024, 13:25:51 UTC"]
```

### Example 3: Parsing Dates

```javascript
const parsedDate = dateTanParse("12-09-2024", "MM-DD-YYYY");
console.log(parsedDate); // Output: Tue Dec 09 2024 00:00:00 GMT+0000 (UTC)
```

### Example 4: Custom Tokens

```javascript
const customFormat = "MMMM Do, YYYY [at] HH:mm tt (Z)";
console.log(dateTan(new Date(), customFormat, "en-us"));
// Output: December 9th, 2024 at 13:25 PM (+00:00)
```

### Example 5: Check Holidays

```javascript
const holidayMessage = dateTan(new Date(), "H", "en-us");
console.log(holidayMessage); // Output: "No holiday today!" or a holiday name.
```

### Example 6: Custom Locales

You can pass an array of locales to `dateTan` to specify fallback options if the primary locale is not available.

```javascript
const date = new Date();
const customLocales = ["fr-fr", "en-us"]; // French fallback to English
console.log(dateTan(date, "DDDD, MMMM Do, YYYY", customLocales));
// Output: Lundi, Décembre 9e, 2024 (if 'fr-fr' is present in locales.json)
// Or: Monday, December 9th, 2024 (fallback to 'en-us')
```

### Example 7: Handling Time Zones

Use custom tokens to include time zone offsets and names in the formatted date.

```javascript
const date = new Date();
const customFormat = "MMMM DD, YYYY, HH:mm:ss Z (TZ)";
console.log(dateTan(date, customFormat, "en-us"));
// Output: December 09, 2024, 13:25:51 +00:00 (UTC)
```
