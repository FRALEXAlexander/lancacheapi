
import 'dotenv/config'
import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser'
import http from 'http'

import loadLogFile from "./utils/loadLogFile.js"
import loadSteamApps from "./utils/loadSteamApps.js";
import riotRouter from "./routes/riot.route.js"
import steamRouter from "./routes/steam.route.js"
import cacheRouter from "./routes/cache.route.js"

import * as db from "./services/database.js"
import * as steam from "./services/steam.js"

db.createTables()

const app = express();

app.use(cors());


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/riot", riotRouter);
app.use("/steam", steamRouter);
app.use("/cache", cacheRouter);

const server = http.createServer(app)



server.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}  http://localhost:${process.env.PORT}`);
  });


//steam.addAppToDB(1286830)

//loadLogFile()

//console.log(steam.getAppByID(1007))

//await loadSteamApps()


process.on('SIGINT', () => {
    console.log('Received SIGINT signal. Stopping Node.js application.');


    db.close()
    process.exit(0); // Exit with success status code
});

