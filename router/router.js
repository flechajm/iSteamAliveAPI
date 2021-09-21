require("dotenv").config();
const express = require("express");
const router = express.Router();
const nodeCache = require("node-cache");
const cacheTTLSecs = process.env.CACHE_SECS;
const cacheCheckPeriod = process.env.CHECK_PERIOD;

const cacheSecs = !isNaN(cacheTTLSecs) && cacheTTLSecs > 0 ? cacheTTLSecs : 0;
const cache = new nodeCache({
  stdTTL: cacheSecs,
  checkperiod: cacheCheckPeriod,
  useClones: false,
});
const iSteamAlive = new (require("../scrapper/isteam_alive"))(cache);

router.get("/", iSteamAlive.getHome);
router.get("/api/status", iSteamAlive.getStatus);

module.exports = router;
