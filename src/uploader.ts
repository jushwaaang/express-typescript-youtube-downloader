import { Upload } from "tus-js-client";
import fs from "fs";
import axios from "axios";

export function uploadFileToTus(
  filePath: string,
  callbackUrl: string,
  uuid: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createReadStream(filePath);
    const uploadUrl = `https://uploader.tvstartupmedia.com/api/v2/server.php`;

    const upload = new Upload(file, {
      endpoint: uploadUrl,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      chunkSize: 5000000,
      parallelUploads: 1,
      metadata: {
        filename: `${uuid}.mp4`,
        filetype: "mp4",
      },
      onError: (error) => {
        console.error("Failed because: " + error);
        handleCallback(callbackUrl, "failed"); // Handle failure
        reject(error);
      },
      onProgress: (bytesUploaded: number, bytesTotal: number) => {
        const percentage = (bytesUploaded / bytesTotal) * 100;
        console.log(`Upload progress: ${percentage.toFixed(2)}%`);
      },
      onSuccess: () => {
        console.log("Upload complete:", upload.url);
        handleCallback(callbackUrl, "uploaded");

        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Failed to delete file:", err);
          } else {
            console.log("File deleted successfully:", filePath);
          }
        });
        resolve();
      },
    });

    upload.start();
  });
}

function handleCallback(callbackUrl?: string, status?: string): void {
  if (!callbackUrl || !status) return;

  const urlWithStatus = `${callbackUrl}&status=${status}`;
  axios
    .get(urlWithStatus)
    .then((response) => {
      console.log(`Webhook called successfully`);
    })
    .catch((error) => {
      console.error("Failed to call webhook:", error.message);
    });
}
