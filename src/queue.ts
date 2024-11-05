import { Queue } from "bullmq";
import dotenv from "dotenv";
import config from "./config";

dotenv.config();

const redisConfig = {
  host: config.redisHost,
  port: config.redisPort,
  username: config.redisUsername,
  password: config.redisPassword,
};

const videoDownloadQueue = new Queue<any>("videoDownload", {
  connection: redisConfig,
});

const videoUploadQueue = new Queue<any>("videoUpload", {
  connection: redisConfig,
});

export { videoDownloadQueue, videoUploadQueue };
