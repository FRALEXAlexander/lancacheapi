import fs from "fs"
import readline from "readline"
import createItemFromLogLine from "../utils/logParser.js"
import * as db from "../services/database.js"

export default async function loadLogFile() {

    console.log("Loading log File....")

    let logLinesRead = 0

    let logLines = await new Promise((resolve, reject) => {
        let count = 0
        fs.createReadStream(process.env.LOGDir + "/access.log")
            .on('data', function (chunk) {
                for (let i = 0; i < chunk.length; ++i)
                    if (chunk[i] == 10) count++;
            })
            .on('end', function () {
                console.log(count);
                resolve(count)
            });

    })

    const rl = readline.createInterface({
        input: fs.createReadStream(process.env.LOGDir + "/access.log"),
        crlfDelay: Infinity
    });

    let buffer = []
    rl.on('line', line => {
        // process the data chunk
        logLinesRead++
        //  db.insertAccessLog(createItemFromLogLine(line.toString()))
        buffer.push(createItemFromLogLine(line.toString()))
        if (logLinesRead % 500 == 0){
            console.log("[LOGS] Insert", logLinesRead, "of", logLines)

            db.insertAccessLog(buffer)

            buffer = []
        } 



    });

    rl.on('close', () => {
        console.log('file has been read completely');
        db.insertAccessLog(buffer)
        console.log("Log File loaded")
    });




}