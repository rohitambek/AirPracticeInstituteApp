import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import adminRoutes from './server/routes/adminRoutes.ts';
import authRoutes from './server/routes/authRoutes.ts';
import dashboardRoutes from './server/routes/dashboardRoutes.ts';
import materialRoutes from './server/routes/materialRoutes.ts';
import notificationRoutes from './server/routes/notificationRoutes.ts';
import practiceRoutes from './server/routes/practiceRoutes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Body parser with 25mb limit for PDF files
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Basic CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // API Routes
  app.use('/api/admin', adminRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/materials', materialRoutes);
  app.use('/api', practiceRoutes);

  // Health endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'UP',
      institute: 'AIR Practice Institute',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Serve static public assets (icons, manifest, images)
  app.use(express.static(path.resolve(__dirname, 'public')));

  // Frontend Integration: Vite in dev, static files in production
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // Dynamic import to avoid bundling vite in production
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 AIR Practice Institute Server running on port ${PORT}`);
    console.log(`🔗 Local: http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
}

startServer().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
