import * as steam from "../services/steam.js"

export async function getApps(req, res, next) {
    try {
        if (req.query.id && !isNaN(req.query.id)) {
            res.json({ status: "success", data: await steam.getAppByID(req.query.id) });
        } else {
            res.json({ status: "success", data: await steam.getApps() });
        }
    } catch (err) {
        console.error(`Error while getting data`, err.message);
        next(err);
    }
}

export async function getCachedApps(req, res, next) {
    try {
            
            res.json(steam.getDataByDepot(true) );
        
    } catch (err) {
        console.error(`Error while getting data`, err.message);
        next(err);
    }
}


export async function getCacheStatus(req, res, next) {
    try {
        res.json({
            status: "success", data: {
                cachedApps: await steam.getCachedAppsAmount(),
                cachedDepots: await steam.getCachedDepotsAmount(),
                allApps: (await steam.getSteamApps()).length

            }
        });
    } catch (err) {
        console.error(`Error while getting data`, err.message);
        next(err);
    }
}

