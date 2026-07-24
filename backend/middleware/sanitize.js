const xss = require('xss');

/**
 * Recursively strips malicious HTML/JS from strings in an object in place.
 * Replacement for the unmaintained `xss-clean` package (last published 2020,
 * built on an outdated `xss` version with known bypasses). This walks
 * req.body/req.query/req.params using the actively maintained `xss` library.
 */
const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return xss(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      value[key] = sanitizeValue(value[key]);
    }
    return value;
  }

  return value;
};

const sanitizeRequest = (req, res, next) => {
  if (req.body) sanitizeValue(req.body);
  if (req.query) sanitizeValue(req.query);
  if (req.params) sanitizeValue(req.params);
  next();
};

module.exports = sanitizeRequest;