const config = require("../package.json");
const puppeteer = require("puppeteer");
const status = require("./status");
const steamStatusURL = "https://steamstat.us";

/**
 * The core class to manage the scraping.
 */
class iSteamAlive {
  constructor(cache) {
    this.cache = cache;
  }

  getHome = async (_req, res) => {
    res.send(
      "<pre>Visit <b>iSteamAlive API</b> (v" +
        config.version +
        ") on <a href='https://github.com/flechajm/iSteamAliveAPI'>GitHub</a>.</pre>"
    );
  };

  /**
   * Gets the status of the Steam Services.
   * @param {*} _req Request.
   * @param {*} res Response.
   */
  getStatus = async (_req, res) => {
    let browser;

    try {
      const cacheValue = this.cache.get(steamStatusURL);

      if (cacheValue !== undefined) {
        res.send(cacheValue);
      } else {
        browser = await this.#getBrowser();
        const page = await this.#goToSteamStatus(browser);
        const jsonParsed = await this.#getJSON(page);

        this.cache.set(steamStatusURL, jsonParsed);
        res.send(jsonParsed);
      }
    } catch (e) {
      res.sendStatus(500);
    } finally {
      if (browser) await browser.close();
    }
  };

  /**
   * Gets the JSON mapped after scraping the web.
   * @returns JSON String.
   */
  async #getJSON(page) {
    const json = await page
      .evaluate((selector) => {
        const servicesData = [];
        const elements = document.querySelectorAll(selector);

        let name;
        let status;
        let alert;

        for (let i = 0; i < elements.length; i++) {
          const serviceDOM = elements[i];
          if (serviceDOM.textContent != "") {
            if (i % 2 == 0) {
              name = serviceDOM.textContent.trim();
            } else {
              status = serviceDOM.textContent.trim();
              alert = serviceDOM.className.split(" ")[1];

              if (alert != null) {
                servicesData.push(new Array(name, status, alert));
              }
            }
          }
        }

        return servicesData;
      }, ".service > span")
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
  async #goToSteamStatus(browser) {
    const page = await browser.newPage();
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
      const service = services[i];

      let data = { name: service[0], status: service[1], alert: service[2] };

      switch (i) {
        case 0:
          status.steam_platform.online = data;
          break;
        case 1:
          status.steam_platform.ingame = data;
          break;
        case 2:
          status.steam_platform.store = data;
          break;
        case 3:
          status.steam_platform.community = data;
          break;
        case 4:
          status.steam_platform.webapi = data;
          break;
        case 5:
          status.steam_platform.connection_managers = data;
          break;
        case 6:
          status.game_coordinators.team_fortress2 = data;
          break;
        case 7:
          status.game_coordinators.dota2 = data;
          break;
        case 8:
          status.game_coordinators.underlords = data;
          break;
        case 9:
          status.game_coordinators.artifact = data;
          break;
        case 10:
          status.game_coordinators.csgo = data;
          break;
        case 11:
          status.csgo_services.sessions_logon = data;
          break;
        case 12:
          status.csgo_services.player_inventories = data;
          break;
        case 13:
          status.csgo_services.matchmaking_scheduler = data;
          break;
        default:
          break;
      }
    }

    return status;
  }
}

module.exports = iSteamAlive;
