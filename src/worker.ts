import { Worker } from "bullmq";
import dotenv from "dotenv";
import config from "./config";
import { downloadYouTubeVideo } from "./downloader";
import { uploadFileToTus } from "./uploader";

dotenv.config();

const downloadWorker = new Worker(
  "videoDownload",
  async (job) => {
    await downloadYouTubeVideo(job.data);
  },
  {
    connection: {
      host: config.redisHost,
      port: config.redisPort,
      username: config.redisUsername,
      password: config.redisPassword,
    },
  }
);

const uploadWorker = new Worker(
  "videoUpload",
  async (job) => {
    const { outputFileName, callbackUrl, uuid } = job.data;
    await uploadFileToTus(outputFileName, callbackUrl, uuid);
  },
  {
    connection: {
      host: config.redisHost,
      port: config.redisPort,
      username: config.redisUsername,
      password: config.redisPassword,
    },
  }
);

downloadWorker.on("ready", () => {
  console.log("Download worker is ready to process jobs!");
});

uploadWorker.on("ready", () => {
  console.log("Upload worker is ready to process jobs!");
});

downloadWorker.on("completed", (job) => {
  console.log(`Download job with ID ${job.id} completed!`);
});

uploadWorker.on("completed", (job) => {
  console.log(`Upload job with ID ${job.id} completed!`);
});

downloadWorker.on("failed", (job: any, err) => {
  console.error(
    `Download job with ID ${job.id} failed with error: ${err.message}`
  );
});

uploadWorker.on("failed", (job: any, err) => {
  console.error(
    `Upload job with ID ${job.id} failed with error: ${err.message}`
  );
});
