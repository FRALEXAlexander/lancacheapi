// logParser.js
import parseDateString from './dataParser.js';

export default function createItemFromLogLine(logLine) {
    const regex = /\[(.*?)\] (\d+\.\d+\.\d+\.\d+) \/ .* \[(.*?)\] "(.*?)" (\d+) (\d+) "(.*?)" "(.*?)" "(.*?)" "(.*?)"/;
    const matches = logLine.match(regex);

    if (matches) {
        const [, service, clientIp, timestampStr, urlData, httpCode, size, , serverInfo, isCacheHit, serverURL] = matches;

        const timestamp = parseDateString(timestampStr)

        const item = {
            service,
            clientIp,
            timestamp,
            urlData,
            httpCode: parseInt(httpCode),
            size: parseInt(size),
            serverInfo,
            isCacheHit: isCacheHit === "HIT" ? 1 : 0,
            serverURL,
        };

        return item;
    } else {
        return null; // Return null if the log line doesn't match the expected format
    }
}