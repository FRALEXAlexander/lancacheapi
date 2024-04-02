import { db } from "./database.js"

export function getGames() {

    const stmt = db.prepare(`SELECT serverURL,sum(size) as downloadSize,isCacheHit FROM accesslog WHERE service = ? GROUP BY isCacheHit`)
    return stmt.all("riot")
}