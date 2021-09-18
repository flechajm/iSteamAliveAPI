const express = require("express");
const puppeteer = require("puppeteer");
const app = express();

app.get("/", function (req, res) {
  (async () => {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setUserAgent("Chrome/93.0.4577.0");
    await page.goto("https://steamstat.us", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    const result = await page
      .evaluate(() => {
        return Array.from(document.querySelectorAll(".service")).map(
          (el) => el.textContent
        );
      })
      .then((services) => {
        let status = {
          steam_platform: {
            online: "",
            ingame: "",
            store: "",
            community: "",
            webapi: "",
            connection_managers: "",
          },
          game_coordinators: {
            team_fortress2: "",
            dota2: "",
            artifact: "",
            underlords: "",
            csgo: "",
          },
          csgo_services: {
            sessions_logon: "",
            player_inventories: "",
            matchmaking_scheduler: "",
          },
        };

        for (let i = 0; i < services.length; i++) {
          const service = String(services[i]);
          const serviceSplit = service
            .split("\n")
            .filter((s) => s)
            .map((s) => s.trim());
          if (serviceSplit.length == 2) {
            switch (i) {
              case 0:
                status.steam_platform.online = serviceSplit[1];
                break;
              case 1:
                status.steam_platform.ingame = serviceSplit[1];
                break;
              case 2:
                status.steam_platform.store = serviceSplit[1];
                break;
              case 3:
                status.steam_platform.community = serviceSplit[1];
                break;
              case 4:
                status.steam_platform.webapi = serviceSplit[1];
                break;
              case 5:
                status.steam_platform.connection_managers = serviceSplit[1];
                break;
              case 7:
                status.game_coordinators.team_fortress2 = serviceSplit[1];
                break;
              case 8:
                status.game_coordinators.dota2 = serviceSplit[1];
                break;
              case 9:
                status.game_coordinators.underlords = serviceSplit[1];
                break;
              case 10:
                status.game_coordinators.artifact = serviceSplit[1];
                break;
              case 11:
                status.game_coordinators.csgo = serviceSplit[1];
                break;
              case 12:
                status.csgo_services.sessions_logon = serviceSplit[1];
                break;
              case 13:
                status.csgo_services.player_inventories = serviceSplit[1];
                break;
              case 14:
                status.csgo_services.matchmaking_scheduler = serviceSplit[1];
                break;
              default:
                break;
            }
          }
        }
        return JSON.stringify(status);
      });

    await browser.close();
    res.send(result);
  })();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("El servidor está inicializado en el puerto 3000");
});
