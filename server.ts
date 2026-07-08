/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

// Since we compile this file using esbuild to CJS in production,
// let's define __dirname gracefully for both ESM and CJS environments.
let currentDirname = '';
try {
  currentDirname = path.dirname(fileURLToPath(import.meta.url));
} catch {
  currentDirname = __dirname;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON payload parser
  app.use(express.json());

  // API Routes (e.g. general diagnostic endpoint for network/backend sanity)
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      platform: process.platform,
      nodeVersion: process.version
    });
  });

  // Serve static assets/Vite app depending on target environment
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running Express server in development mode with Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Running Express server in production mode serving static dist files...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pulse Diagnostics backend server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
