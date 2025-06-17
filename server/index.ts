import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Increase JSON payload size limit to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Simple logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      const logLine = `${req.method} ${path} - ${res.statusCode} (${duration}ms)`;
      log(logLine);
    }
  });

  next();
});

async function startServer() {
  // Import and setup authentication
  const { setupAuth } = await import("./auth");
  setupAuth(app);

  // Error handling
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    console.error(`Error ${status}:`, message);
    res.status(status).json({ message });
  });

  // Register all routes
  const httpServer = await registerRoutes(app);

  // Setup Vite for development/static serving
  if (app.get("env") === "development") {
    await setupVite(app, httpServer);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT) || 5000;
  httpServer.listen(port, "0.0.0.0", () => {
    log(`Express server running at http://localhost:${port}`);
  });
}

startServer().catch(console.error);