import express from "express";
import path from "path";
import notificationRoutes from "./server/notifications";
import { startScheduler } from "./server/scheduler";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mount API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  
  app.use(notificationRoutes);

  const isProd = process.env.NODE_ENV === "production" || 
                  
                 (process.argv[1] && process.argv[1].endsWith('.cjs'));
                 
  if (isProd) {
    process.env.NODE_ENV = "production";
  }

  if (!isProd) {
    // Dynamic import to avoid loading Vite in production
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In CJS bundle, __dirname is the dist folder. 
    // In dev mode (ESM), this branch won't execute, so __dirname is not needed.
    // However, if it executes in ESM somehow, fallback to process.cwd() + '/dist'
    const distPath = typeof __dirname !== 'undefined' ? __dirname : path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Start background cron jobs after middleware setup
  startScheduler();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
