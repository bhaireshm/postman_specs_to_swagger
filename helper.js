exports.requireProcessEnv = (name) => {
  if (!process.env[name]) {
    logger("You must set the " + name + " environment variable", "red");
  }
  return process.env[name];
};

exports.isEmpty = (data) => {
  if (typeof data == "number" || typeof data == "boolean") return false;
  if (typeof data == "undefined" || data === null) return true;
  if (typeof data.length != "undefined") return data.length == 0;
  let count = 0;
  for (let d in data) if (Object.hasOwnProperty.call(data, d)) count++;
  return count == 0;
};

exports.checkObject = (o, ignore = "") => {
  if (o) o = Object(o);
  for (var k in o) {
    if (!ignore.split(",").includes(k) && this.isEmpty(o[k])) {
      return CustomResponse.serviceResponse(o, `${k} cannot be empty.`, false);
    }
  }
  return CustomResponse.serviceResponse(o, null);
};

exports.uniqueArr = (arr = []) => {
  const uArr = [];
  arr.forEach((a) => {
    if (uArr.indexOf(a) === -1) uArr.push(a);
  });
  return uArr;
};

exports.dateDiff = (from, to) => {
  from = new Date(from);
  to = new Date(to);
  const diffMs = to - from; // milliseconds between from & to
  const diffDays = Math.floor(diffMs / 86400000); // days
  const diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
  const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
  let str = "";
  str += diffDays ? diffDays + "d " : "";
  str += diffHrs ? diffHrs + "h" : "";
  str += diffMins ? " " + diffMins + "m" : "";
  return str.trimEnd().trimStart().replace(/ {2}/g, " ");
};

exports.serialize = (o = {}) =>
  Object.entries(o)
    .map((p) => `${encodeURIComponent(p[0])}=${encodeURIComponent(p[1])}`)
    .join("&");

exports.hasOwnProperty = (obj, keys, returnKey = false) => {
  if (this.isEmpty(obj) || this.isEmpty(keys)) return false;
  else {
    if (returnKey) {
      return (
        keys
          .split(",")
          .map((k) => {
            if (this.isEmpty(k.split(":")[0]) && !Object.hasOwnProperty.call(obj, k.split(":")[0]))
              return `${k.split(":").reverse()[0]} not found`;
          })
          .filter((a) => typeof a == "string")[0] || true
      );
    } else {
      return !keys
        .split(",")
        .map((k) => {
          if (k != "" && !Object.hasOwnProperty.call(obj, k)) return false;
        })
        .some((a) => a == false);
    }
  }
};

exports.sortObjectByKey = (obj = [], key = "", o = 1) =>
  obj.sort((a, b) => (a[key] > b[key] ? 1 * 0 + o : b[key] > a[key] ? 1 * 0 - o : 0));

exports.sortObjectByMultipleKeys = (arr = [], keys = []) => {
  return arr.sort(function (a, b) {
    return keys
      .map(function (o) {
        var dir = 1;
        if (o[0] === "-") {
          dir = -1;
          o = o.substring(1);
        }
        if (a[o] > b[o]) return dir;
        if (a[o] < b[o]) return -dir;
        return 0;
      })
      .reduce(function firstNonZeroValue(p, n) {
        return p ? p : n;
      }, 0);
  });
};

exports.generateRandomString = (options) => {
  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,./~`-=";
  const length = options.strLength || 13;
  const getRandomChar = (c) => c.charAt(Math.floor(Math.random() * c.length));
  let chars = "";
  chars = options.alphabets ? chars + alphabets : chars;
  chars = options.numbers ? chars + numbers : chars;
  chars = options.specialChars ? chars + specialChars : chars;
  let res = "";
  for (var i = 0; i < length; i++) res += getRandomChar(chars);
  return res;
};

exports.removeKeys = (data, keys = "") => {
  const obj = { ...data };
  for (const k in obj) if (keys.split(",").some((nr) => nr == k)) delete obj[k];
  return obj;
};

exports.strCompare = (s1, s2, ignoreCase = true) => {
  if (ignoreCase) return s1.toString().toLowerCase() === s2.toString().toLowerCase();
  else return s1.toString() === s2.toString();
};

exports.getKeys = (obj, separator = ",") => Object.keys(obj).join(separator);

exports.toNumber = (s, returnStrings = false) =>
  isNaN(Number(s)) ? (returnStrings ? s : error(`${s} NaN`)) : Number(s);

exports.strToNum = (d, str) => {
  const data = d;
  if (typeof data == "object") {
    if (!str && data.length > 0) return data.map((d) => this.toNumber(d, true));
    if (str && data.length == undefined) {
      const out = {};
      Object.entries(data)
        .map((d) => {
          if (str.split(",").some((s) => s == d[0])) d[1] = this.toNumber(d[1], true);
          return d;
        })
        .forEach((a) => (out[a[0]] = a[1]));
      return out;
    }
  }
};

exports.isMatched = (s1, s2) => {
  return s2.some((s) => s === s1);
};

exports.addHours = (time, hrs = 0) => {
  const d = new Date(time);
  d.setHours(hrs + d.getHours());
  return d;
};

Date.prototype.addHours = function (hrs) {
  this.setHours(+hrs + this.getHours());
  return this;
};

Date.prototype.subtractHours = function (hrs) {
  this.setHours(this.getHours() - +hrs);
  return this;
};

exports.isValidDate = (d) => {
  return d instanceof Date && !isNaN(d);
};

exports.toDate = (data, dateKeys) => {
  const out = data;
  dateKeys.split(",").forEach((d) => {
    out[d] = new Date(out[d]);
  });
  return out;
};

exports.checkKeyAndValue = (obj, key) => {
  return this.hasOwnProperty(obj, key) && !this.isEmpty(obj[key]);
};

exports.strToNumFromSchema = (obj, model) => {
  const schema = model.schema.tree;
  const keys = Object.keys(schema)
    .filter((s) => schema[s].type === Number)
    .join(",");
  return this.strToNum(obj, keys);
};

exports.strToDateFromSchema = (obj, model) => {
  const schema = model.schema.tree;
  const keys = Object.keys(schema)
    .filter((s) => schema[s].type === Date)
    .join(",");
  return this.toDate(obj, keys);
};

exports.getRequiredData = (obj, keys) => {
  const out = {};
  for (const k in obj) if (keys.split(",").some((nr) => nr == k)) out[k] = obj[k];
  return out;
};

exports.getNestedValue = (obj = {}, key = "") => {
  if (key.split(".").length > 1) return key.split(".").reduce((prev, curr) => prev[curr], obj);
  else return obj[key];
};

exports.arrayIntoChunks = arrayIntoChunks;

exports.objectKeysToLowerCase = objectKeysToLowerCase;

// Private functions
function arrayIntoChunks(arr, n) {
  if (!arr.length) return [];
  return [arr.slice(0, n)].concat(arrayIntoChunks(arr.slice(n), n));
}
