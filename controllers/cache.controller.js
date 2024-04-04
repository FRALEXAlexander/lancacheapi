import * as db from "../services/database.js"

export async function getServers(req, res, next) {
    try {

        if (req.query.service) {
            res.json( db.getDataByServers(req.query.id) );
        } else {
            res.json(db.getDataByServers() );
        }
        

    } catch (err) {
        console.error(`Error while getting data`, err.message);
        next(err);
    }
}


