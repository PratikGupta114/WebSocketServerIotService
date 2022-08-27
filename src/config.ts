
import * as dotenv from "dotenv"

dotenv.config();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

const DEFAULT_PORT = 3001;
const DEFAULT_HOST = "192.168.1.107";

const DEFAULT_REDIS_PORT = 6379;
const DEFAULT_REDIS_HOST = "192.168.1.107";

const DEFAULT_WEBSOCKET_CONNECTION_METRIC_UPDATE_INTERVAL_MILLIS = 60000;
const DEFAULT_BROADCAST_CHANNEL = "broadcast";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

export type BuildType = "development" | "testing" | "release"



export type AppConfiguration = {
    projectId: string;
    buildType: BuildType;
    host: string | undefined;
    port: number;
    redisHost: string;
    redisPort: number;
    broadCastChannel: string;
    connectionMetricUpdateIntervalMillis: number;
}

const buildType: BuildType = String(process.env.NODE_ENV || "development") as BuildType;
const port: number = Number(process.env.PORT) || DEFAULT_PORT;
const host: string = String(process.env.HOST || DEFAULT_HOST);
const projectId: string = String(process.env.PROJECT_ID || "");
const redisPort: number = Number(process.env.REDIS_PORT) || DEFAULT_REDIS_PORT;
const redisHost: string = String(process.env.REDIS_HOST) || DEFAULT_REDIS_HOST;
const websocketConnectionsMetricUpdateInterval = Number(process.env.WEBSOCKET_CONNECTION_METRIC_UPDATE_INTERVAL_MILLIS) || DEFAULT_WEBSOCKET_CONNECTION_METRIC_UPDATE_INTERVAL_MILLIS
const broadCastChannel = String(process.env.BROADCAST_CHANNEL) || DEFAULT_BROADCAST_CHANNEL;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const appConfiguration: AppConfiguration = {
    projectId,
    buildType,
    host,
    port,
    broadCastChannel,
    connectionMetricUpdateIntervalMillis: websocketConnectionsMetricUpdateInterval,
    redisHost,
    redisPort,
}