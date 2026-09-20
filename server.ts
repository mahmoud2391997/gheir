import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import app from './server/app.js';

const PORT = 3000;

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      // Express owns the HTTP server, so Vite cannot attach its HMR websocket
      // listener here. Disable HMR to prevent the injected client from retrying
      // a websocket that can never complete its handshake in middleware mode.
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GHER server running on http://localhost:${PORT}`);
  });
}

startServer();
