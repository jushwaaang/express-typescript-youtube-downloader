# Youtube Downloader Service
This project combines the power of Puppeteer and youtube-dl to enable seamless downloading of YouTube videos. By implementing cookies, it ensures the process mimics human behavior to avoid detection as a bot. This approach makes it ideal for scenarios where traditional methods may fail due to bot-detection mechanisms.

Key features of this service include:

Puppeteer Integration: Simulates human interaction with YouTube to bypass bot detection.
Cookies Support: Leverages authenticated sessions to access restricted or private content.
youtube-dl Compatibility: Harnesses the robust capabilities of youtube-dl for video downloading.

## Getting started
```
docker-compose up -d --build
```