import puppeteer from 'puppeteer';
import youtubeDl from 'youtube-dl-exec';
import path from 'path';

async function sanitizeFilename(title: string): Promise<string> {
  // Replace any characters that are not valid in filenames
  return title.replace(/[<>:"/\\|?*]+/g, '_');
}

async function downloadYouTubeVideo(videoUrl: string) {
  // Launch the browser and open a new page
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to the YouTube video page directly
    await page.goto(videoUrl, { waitUntil: 'networkidle2' });

    // Extract video title for naming the file
    const videoTitle = await page.evaluate(() => {
      const titleElement = document.querySelector('h1.title');
      return titleElement ? titleElement.textContent?.trim() : 'video';
    });

    // Sanitize the video title for use as a filename
    const sanitizedTitle = sanitizeFilename(videoTitle || 'video');
    const outputFileName = path.resolve(__dirname, `${sanitizedTitle}.mp4`);
    console.log(`Downloading video: ${sanitizedTitle}`);

    // Use youtube-dl-exec to download the video
    await youtubeDl(videoUrl, {
      output: outputFileName,
      format: 'mp4',
      cookies: './cookies.txt', // Use cookies.txt for authenticated access
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    });
    console.log('Download complete:', outputFileName);
  } catch (error) {
    console.error('Error during YouTube video download:', error);
  } finally {
    await browser.close();
  }
}

// Run the function with a specific YouTube URL
downloadYouTubeVideo('https://www.youtube.com/watch?v=RU-mMVoMIxw&ab_channel=HDRVISION').catch(console.error);
