import puppeteer from "puppeteer";
import youtubeDl from "youtube-dl-exec";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { spawn } from "child_process";
import { uploadFileToTus } from "./uploader";
import { videoUploadQueue } from "./queue";
import { VideoDownloadDto } from "./interfaces";

// Function to create a unique cookies file with a timestamp and return the filename
function createUniqueCookiesFile() {
  const timestamp = Date.now();
  const cookiesFileName = path.resolve(
    __dirname,
    `cookies/cookies_${timestamp}.txt`
  );
  const cookiesContent = `# Netscape HTTP Cookie File
# HttpOnly cookies are not supported
.example.com    TRUE    /    FALSE   2147483647    cookie_name    cookie_value\n`;
  fs.writeFileSync(cookiesFileName, cookiesContent);
  return cookiesFileName;
}

// Function to delete a file if it exists
function deleteFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted file: ${filePath}`);
  } else console.log(`Cannot find file ${filePath}`);
}

// Function to sanitize video title for use as a filename
function sanitizeFilename(title: string) {
  return title.replace(/[<>:"/\\|?*]+/g, "_");
}

// Function to download video using youtube-dl with a given URL and cookies file
async function downloadVideoWithYoutubeDL(
  videoUrl: string,
  outputFileName: string,
  cookiesFileName: string
) {
  await youtubeDl(videoUrl, {
    output: outputFileName,
    format:
      "bestvideo[height=1080][vcodec^=avc]+bestaudio/best[ext=mp4]/best[ext=mp4]",
    cookies: path.resolve(__dirname, cookiesFileName),
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  });
}

// Function to post-process video with FFmpeg to adjust bitrates and resolution
function postProcessVideo(
  inputFileName: string,
  outputFileName: string,
  cookiesFileName: string,
  callbackUrl: string,
  uuid: string
) {
  const ffmpegCommand = `ffmpeg`;
  const ffmpegArgs = [
    "-i",
    inputFileName,
    "-vf",
    "scale=1920:1080",
    "-b:v",
    "3000k",
    "-b:a",
    "192k",
    "-c:v",
    "libx264",
    "-c:a",
    "aac",
    "-strict",
    "experimental",
    "-y",
    outputFileName,
  ];

  const ffmpegProcess = spawn(ffmpegCommand, ffmpegArgs);
  ffmpegProcess.stderr.on("data", (data) =>
    console.error(`FFmpeg stderr: ${data.toString()}`)
  );

  ffmpegProcess.on("close", (code) => {
    if (code === 0) {
      console.log(
        "Post-processing complete with adjusted bitrates:",
        outputFileName
      );
      deleteFile(inputFileName);
      deleteFile(cookiesFileName);

      videoUploadQueue
        .add("videoUpload", { outputFileName, callbackUrl, uuid })
        .then((job) => {
          console.log(`Job added to Download queue with ID: ${job.id}`);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      console.error(`FFmpeg process exited with code ${code}`);
    }
  });
}

// Main function to download and process a YouTube video
export async function downloadYouTubeVideo(
  videoData: VideoDownloadDto
): Promise<void> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const { url, callback, uuid } = videoData;
  const page = await browser.newPage();
  let cookiesFileName;

  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    const videoTitle = await page.evaluate(() => {
      const titleElement = document.querySelector("h1.title");
      return titleElement ? titleElement.textContent?.trim() : "video";
    });

    const sanitizedTitle = sanitizeFilename(videoTitle || "video");
    const originalFileName = path.resolve(
      __dirname,
      `inputfiles/${uuidv4()}.mkv`
    );
    console.log(`Downloading video: ${sanitizedTitle}`);

    cookiesFileName = createUniqueCookiesFile(); // Generate unique cookies file

    // Download video with youtube-dl
    await downloadVideoWithYoutubeDL(url, originalFileName, cookiesFileName);

    const processedFileName = path.resolve(
      __dirname,
      `outputfiles/${sanitizedTitle}_${uuidv4()}.mp4`
    );
    console.log("Download complete:", originalFileName);

    postProcessVideo(
      originalFileName,
      processedFileName,
      cookiesFileName,
      callback,
      uuid
    );
  } catch (error) {
    console.error("Error during YouTube video download:", error);
  } finally {
    await browser.close();
  }
}
