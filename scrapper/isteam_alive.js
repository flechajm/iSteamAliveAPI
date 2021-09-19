const config = require("../package.json");
const puppeteer = require("puppeteer");
const status = require("./status");
const steamStatusURL = "https://steamstat.us";

/**
 * The core class to manager the scraping.
 */
class ISteamAlive {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  getHome = async (_req, res) => {
    res.send(
      "<pre>Visit <b>ISteamAlive API</b> (v" +
        config.version +
        ") on <a href='https://github.com/flechajm/ISteamAliveAPI'>GitHub</a>.</pre>"
    );
  };

  /**
   * Gets the status of the Steam Services.
   * @param {*} _req Request.
   * @param {*} res Response.
   */
  getStatus = async (_req, res) => {
    try {
      if (this.browser == null && this.page == null) {
        this.browser = await this.#getBrowser();
        this.page = await this.#goToSteamStatus();
      }

      const result = await this.#getJSON();
      res.send(result);
    } catch (e) {
      await this.browser.close();
      res.sendStatus(500);
    }
  };

  /**
   * Gets the JSON mapped after scraping the web.
   * @returns JSON String.
   */
  async #getJSON() {
    const json = await this.page
      .evaluate(() => {
        return Array.from(document.querySelectorAll(".service")).map(
          (el) => el.textContent
        );
      })
      .then((services) => {
        const mappedServices = this.#mapServices(services);
        return JSON.stringify(mappedServices);
      });

    return json;
  }

  /**
   * Instantiates a new Page and navigate to the Steam Status URL, then returns it.
   * @returns An instance of Page.
   */
  async #goToSteamStatus() {
    const page = await this.browser.newPage();
    await page.setUserAgent("Chrome/93.0.4577.0");
    await page.goto(steamStatusURL, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(500);

    return page;
  }

  /**
   * Gets the browser with some arguments.
   * @returns An instance of Browser.
   */
  async #getBrowser() {
    return await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  /**
   * Maps the array of services.
   * @param {Array} services Array of services and their states to be mapped.
   * @returns
   */
  #mapServices(services) {
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

    return status;
  }
}

module.exports = ISteamAlive;
