import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import https from "https";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Proxy Google Drive audio to bypass CORS/virus-scans/auth restrictions
  app.get("/api/music", (req, res) => {
    const fileId = "1fymBVpskH3d1VzyX1PT3B8UQae9h3Zwa";
    const driveUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;

    const fetchAndStream = (url: string) => {
      https.get(url, (driveRes) => {
        const { statusCode, headers } = driveRes;

        // Follow redirect if 302 or 301
        if ((statusCode === 301 || statusCode === 302) && headers.location) {
          fetchAndStream(headers.location);
          return;
        }

        if (statusCode && statusCode >= 400) {
          res.status(statusCode).send("Error fetching audio from Google Drive");
          return;
        }

        // Set proper audio content headers
        res.setHeader("Content-Type", headers["content-type"] || "audio/mpeg");
        if (headers["content-length"]) {
          res.setHeader("Content-Length", headers["content-length"]);
        }
        if (headers["accept-ranges"]) {
          res.setHeader("Accept-Ranges", headers["accept-ranges"]);
        }
        if (headers["content-range"]) {
          res.setHeader("Content-Range", headers["content-range"]);
        }

        driveRes.pipe(res);
      }).on("error", (err) => {
        console.error("Audio proxy error:", err);
        res.status(500).send("Audio proxy server error");
      });
    };

    fetchAndStream(driveUrl);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
