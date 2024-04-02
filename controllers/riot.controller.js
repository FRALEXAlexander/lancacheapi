import * as riot from "../services/riot.js"

export async function getGames(req, res, next) {
    try {

       
            res.json({ status: "success", data: riot.getGames() });
       
        

    } catch (err) {
        console.error(`Error while getting data`, err.message);
        next(err);
    }
}


