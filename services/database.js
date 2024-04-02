import Database from "better-sqlite3"
import fs from "fs"

if (!fs.existsSync("data")) {
  fs.mkdirSync("data")
}
export const db = new Database('data/gameinfo.db', /*{ verbose: console.log }*/)
db.pragma('journal_mode = WAL');


export function createTables() {
  let stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS accesslog (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          service TEXT,
          clientIp TEXT,
          timestamp DATETIME,
          urlData TEXT,
          httpCode INTEGER,
          size INTEGER,
          serverInfo TEXT,
          isCacheHit BOOLEAN,
          serverURL TEXT,
          hash TEXT
        )
      `)
  stmt.run();

  stmt = db.prepare(`
      CREATE TABLE IF NOT EXISTS steamApps (
        appID INTEGER PRIMARY KEY,
        name TEXT,
        icon TEXT
      )
    `)
  stmt.run();

  stmt = db.prepare(`
    CREATE TABLE IF NOT EXISTS steamDepots (
      depotID INTEGER PRIMARY KEY,
      appID INTEGER,
      osList TEXT,
      download INTEGER,
      size INTEGER,
      FOREIGN KEY (appID) REFERENCES steamApps(appID)
    )
  `)
  stmt.run();
}

export function insertAccessLog(items) {


  //console.log(items[0])


  const stmt = db.prepare(`
      INSERT INTO accesslog (service, clientIp, timestamp, urlData, httpCode, size, serverInfo, isCacheHit,serverURL)
      VALUES (@service, @clientIp, @timestamp, @urlData, @httpCode, @size, @serverInfo, @isCacheHit,@serverURL)
    `);

  const insertMany = db.transaction((items) => {

    for (const item of items) stmt.run(item);
  });

  insertMany(items)







}


export function getDataByServers(service) {
  

    if (service != null) {
      const stmt = db.prepare(`SELECT serverURL,service,sum(size) as downloadSize FROM accesslog WHERE service=? GROUP BY serverURL`);
      return stmt.all(service)

    } else {

      const stmt = db.prepare(`SELECT serverURL,service,sum(size) as downloadSize FROM accesslog GROUP BY serverURL`)
      return stmt.all()
    }
  
}

export async function close() {
  db.close()
}

