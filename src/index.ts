import express, { Request, Response } from "express";
import { videoDownloadQueue } from "./queue";

const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

app.post("/download", async (req: Request, res: Response): Promise<any> => {
  // Check if the video URL is provided
  if (!req.body.url) {
    return res
      .status(400)
      .json({ success: false, message: "YouTube URL is required." });
  }

  try {
    const job = await videoDownloadQueue.add("videoDownload", req.body);
    console.log(`Job added to download queue with ID: ${job.id}`);
    return res.json({ success: true, jobId: job.id });
  } catch (error) {
    console.error(error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json({
      success: false,
      message: "Failed to download video.",
      error: errorMessage,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
