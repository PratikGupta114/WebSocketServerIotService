
import express from "express";
var cors = require('cors')
import { appConfiguration } from "./config";
import { createClient } from "redis"
import { createWebsocketConnectionsMetricDescriptor, updateWebsocketConnectionsMetricDescriptor } from "./Monitoring";

const app = express();

app.use(cors()) 

type ClientConnectionRecord = {
    connectedPath: string;
    instanceID?: string;
    instanceName?: string;
    lastPongReceived: number;
}

const client = createClient({
    socket: {
        host: appConfiguration.redisHost,
        port: appConfiguration.redisPort
    }
});

(async () => {
    try {
        client.on("error", (err) => {
            console.error(`Error while connecting to redis cache : ${err}`);
        });
        await client.connect();

    } catch (error) {
        console.error(error);
    }
    console.log("Connected to Redis Sever with host : ", appConfiguration.redisHost, " and port : ", appConfiguration.redisPort);
})();

app.get("/activeConnections", async (req, res) => {

    const keys = await client.keys("*");
    const count = keys.length;

    const connectionsList: any[] = [];

    if (!keys) {
        res.status(200).send({
            message: "No Connected Devices"
        });
        return;
    }

    for (const key of keys) {
        const record: ClientConnectionRecord = JSON.parse(String(await client.get(key)) || "");
        connectionsList.push({
            ...record,
            deviceID: key
        });
    }
    res.status(200).send({
        message: `Total Connections : ${count}`,
        count,
        connections: connectionsList
    });

});

app.post("/broadcast", async (req, res) => {

    const message: string = String(req.query.message || "");

    if (!message) {
        res.status(500).send({
            message: "Enter a Valid message"
        });
        return;
    }

    await client.publish(appConfiguration.broadCastChannel, message)

    res.status(200).send({
        message: "Broadcast Success : " + JSON.stringify(message)
    });

});

app.listen(appConfiguration.port, () => {
    console.log("App is now listening to port : ", appConfiguration.port);
});

setInterval(() => {
    console.log("Updating metrics");
}, appConfiguration.connectionMetricUpdateIntervalMillis);

if (appConfiguration.buildType !== "development") {
    // Once the server is up and runnning, make an attempt to create the metric
    console.log("Not running in development mode", appConfiguration.buildType);

    try {
        (async () => await createWebsocketConnectionsMetricDescriptor())();
        console.log("Successfully created metric");
    } catch (err) {
        console.error(err);
    }

    setInterval(async () => {
        try {
            const keys = await client.keys("*");
            const count = keys.length;

            console.log("Curernt web socket clients : ", count);
            await updateWebsocketConnectionsMetricDescriptor(
                count,
                appConfiguration.port
            );
            console.log("Successfully updated metric");
        } catch (error) {
            console.error(error);
        }
    }, appConfiguration.connectionMetricUpdateIntervalMillis);
}

setInterval(async () => {
    const keys = await client.keys("*");
    for (const key of keys) {
        const record: ClientConnectionRecord = JSON.parse(String(await client.get(key)) || "");
        const now = new Date().getTime();
        if (now - record.lastPongReceived >= appConfiguration.connectionTimoutDurationMillis) {
            await client.del(key);
        }
    }
}, appConfiguration.connectionTerminationCheckInterval);