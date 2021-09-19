require("dotenv").config();
const config = require("../package.json");
const apiKeyHeader = "apikey";

/**
 * A middleware class to verify requests.
 */
class Middleware {
  /**
   * Validates that requests have a valid API Key.
   * @param {*} req Request.
   * @param {*} res Response.
   * @param {*} next Next.
   */
  validateApiKey = function (req, res, next) {
    if (
      req.path != "/" &&
      config.requiresApiKey &&
      (typeof req.headers[apiKeyHeader] === "undefined" ||
        req.headers[apiKeyHeader] != process.env.APIKEY)
    ) {
      res.status(403).send("<pre>API key was not provided.</pre>");
    } else {
      next();
    }
  };
}

module.exports = Middleware;
