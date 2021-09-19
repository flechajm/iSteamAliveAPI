const express = require("express");
const router = express.Router();
const ISteamAlive = new (require("../scrapper/isteam_alive"))();

router.get("/", ISteamAlive.getHome);
router.get("/api/status", ISteamAlive.getStatus);

module.exports = router;
