import * as db from "../services/database.js"

export async function getServers(req, res, next) {
    try {

        if (req.query.service) {
            res.json({ status: "success", data: await db.getDataByServers(req.query.id) });
        } else {
            res.json({ status: "success", data:  await db.getDataByServers() });
        }
        

    } catch (err) {
        console.error(`Error while getting data`, err.message);
        next(err);
    }
}


