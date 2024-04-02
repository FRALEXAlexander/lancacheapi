import axios from "axios";
import { db } from "./database.js"

let refetch = true
let steamApps = []

export async function getSteamApps() {
    setInterval(() => {
        refetch = true
    }, 1000 * 60 * 5);
    if (refetch) {
        refetch = false
        return new Promise((resolve, reject) => {
            axios.get(`https://api.steampowered.com/ISteamApps/GetAppList/v1/`)
                .then(function (response) {
                    // handle success
                    steamApps = response.data.applist.apps.app
                    resolve(response.data.applist.apps.app)
                })
                .catch(function (error) {
                    // handle error
                    console.log(error);
                })
                .finally(function () {
                    // always executed
                });
        })
    } else {
        return steamApps
    }
}

export async function getAppData(appID) {
    return new Promise((resolve, reject) => {
        axios.get(process.env.STEAMCMDAPIURL+`/v1/info/${appID}`)
            .then(function (response) {
                // handle success
                resolve(response.data.data[appID])
            })
            .catch(function (error) {
                // handle error
                //   console.log(error);
                reject(error)
            })
            .finally(function () {
                // always executed
            });
    })
}

export function insertApp(item) {

    const stmt = db.prepare(`
          INSERT OR IGNORE INTO steamApps (appID, name, icon)
          VALUES (?, ?, ?)
        `);

    return stmt.run(item.appID, item.name, item.icon);

}

export function insertDepot(item) {

    const stmt = db.prepare(`
          INSERT OR REPLACE INTO steamDepots (depotID,appID, osList, download,size)
          VALUES (?, ?, ?, ?, ?)
        `);
    return stmt.run(item.depotID, item.appID, item.osList, item.download, item.size);
}

export function getAppByID(appID) {

    const stmt = db.prepare(`SELECT * FROM steamApps WHERE appID = ?;`)
    return stmt.get(appID)
}

export function getApps() {

    const stmt = db.prepare(`SELECT * FROM steamApps`)
    return stmt.all()
}

export async function addAppToDB(appID, tempName) {
    return await new Promise(async (resolve, reject) => {
        const app = await this.getAppByID(appID)
        if (app != undefined) {
            //  console.log("allready cached ", app)
            reject("allready cached ", app)
            return
        } else {

        }

        this.getAppData(appID).then(async appData => {


            //   console.log(appData)
            //  Object.keys(appData).length === 0 || appData.common == undefined ||
            if (appData.depots == undefined) {
                if (appData.common == undefined) {
                    await this.insertApp({ appID: appID, name: tempName, icon: "null" })
                    reject("no common")
                    return
                }
                await this.insertApp({ appID: appID, name: appData.common.name, icon: appData.common.icon })
                reject("no depots "+appID)
                return
            }
            //console.log(appData)

            await this.insertApp({ appID: appID, name: appData.common.name, icon: appData.common.icon })

            Object.keys(appData.depots).forEach(async depot => {
                let depotID = depot
                if (isNaN(depotID)) return
                depot = appData.depots[depot]
                if (depot.manifests == undefined) return
                if (depot.manifests.public == undefined) return
                if (depot.depotfromapp != undefined) return
                if (depot.dlcappid != undefined) return
                // console.log(depotID, depot.config, depot.manifests)
                const download = depot.manifests ? depot.manifests.public.download : -1;
                const size = depot.manifests ? depot.manifests.public.size : -1;
                const osList = depot.config ? depot.config.oslist : "";

                await this.insertDepot({ depotID: depotID, appID: appID, osList: osList, download: download, size: size })
            });
            resolve(appData.common.name)
        }).catch(err => {
            reject("Error getting data from steamcmdapi")
        })
    })
}

export function getAppByDepot(depotID) {

    const stmt = db.prepare(`SELECT steamDepots.depotID, steamDepots.appID,steamApps.name,steamApps.icon
            FROM steamDepots
            JOIN steamApps ON steamDepots.appID = steamApps.appID
            WHERE steamDepots.depotID = ?;`)

    return stmt.get(depotID)

}

export function getDataByDepot(isCacheHit) {

    const stmt = db.prepare(`SELECT
        SUBSTR(urlData, 
            INSTR(urlData, '/depot/') + LENGTH('/depot/'), 
            INSTR(SUBSTR(urlData, INSTR(urlData, '/depot/') + LENGTH('/depot/')), '/') - 1
           ) AS depotID,
     sum(size) as downloadSize
    FROM 
        accesslog
    WHERE
        service=? AND isCacheHit=?
    GROUP BY 
        depotID;`)


    let rows = stmt.all("steam", isCacheHit ? 1 : 0)

    for (let index = 0; index < rows.length; index++) {
        let row = rows[index];
        try {
            let game = getAppByDepot(row.depotID)
            row.appID = game.appID;
            row.name = game.name
            row.icon = game.icon
        } catch (error) {
            row.appID = -1;
            row.name = "unknown"
        }


    }


    rows =rows.reduce((accumulator, currentValue) => {
        const existingEntry = accumulator.find(entry => entry.appID === currentValue.appID);
        if (existingEntry) {
          existingEntry.downloadSize += currentValue.downloadSize;
        } else {
          accumulator.push(currentValue);
        }
        return accumulator;
      }, []);


    return rows


}

export function getCachedAppsAmount() {

    const stmt = db.prepare(`SELECT count(*) as length FROM steamApps`)

    return stmt.get().length

}

export function getCachedDepotsAmount() {

    const stmt = db.prepare(`SELECT count(*) as length FROM steamDepots`)
    return stmt.get().length

}