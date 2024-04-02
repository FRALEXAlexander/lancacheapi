import * as steam from "../services/steam.js"
import fs from "fs"

export default async function loadSteamApps() {

    let steamApps = JSON.parse(fs.readFileSync("./data/steamapps.json")).applist.apps.app
     
    const cachedApps = await steam.getApps()
    let cachedAppIDs = []
  
    for (let index = 0; index < cachedApps.length; index++) {
        const element = cachedApps[index];
        cachedAppIDs.push(element.appID)
    }

    // Define the batch size
    const batchSize = parseInt(process.env.STEAMCMDBATCHSIZE);

    // Iterate over the apps in batches
    for (let i = 0; i < steamApps.length; i += batchSize) {
        if (i/batchSize % 10 == 0)  console.log("Processing batch starting from index:", i);
       
        await processBatch(i, batchSize,steamApps,cachedAppIDs);
    }
    console.log("Done with loading steamApps")
}

async function processBatch(startIndex, batchSize,steamApps,cachedAppIDs) {
    const batch = steamApps.slice(startIndex, startIndex + batchSize);

    // Map each app to a promise for adding it to the database
    const promises = batch.map(app => {
        // Skip apps with empty names or already cached IDs
        if ( cachedAppIDs.includes(app.appid)) {
            return Promise.resolve(); // Resolve immediately for skipped apps
        }

        // Add the app to the database
        return steam.addAppToDB(app.appid, app.name)
            .then(data => {
                console.log("Added app to DB:",data);
            })
            .catch(err => {
                console.error("Error adding app to DB:", err);
            });
    });

    // Wait for all promises in the batch to resolve
    await Promise.all(promises);
}

