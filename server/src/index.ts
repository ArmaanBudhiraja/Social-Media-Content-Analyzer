import path from 'path';
import { fileURLToPath } from 'url';
import { app } from './app.js';
import { Request, Response, NextFunction } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5001;

// Serve static frontend in production if built
const publicDir = path.join(__dirname, 'public');
const clientDistDir = path.join(__dirname, '../../client/dist');

app.use(app.use(path.posix ? '' : '/', (req, res, next) => next())); // noop safety
app.use(expressStatic(publicDir));
app.use(expressStatic(clientDistDir));

function expressStatic(dir: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) return next();
    import('express').then((express) => {
      express.default.static(dir)(req, res, next);
    });
  };
}

// Fallback SPA routing
app.get('*', (req: Request, res: Response) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ success: false, error: 'API endpoint not found' });
    return;
  }

  const indexPath = path.join(publicDir, 'index.html');
  const clientIndexPath = path.join(clientDistDir, 'index.html');

  res.sendFile(indexPath, (err) => {
    if (err) {
      res.sendFile(clientIndexPath, (err2) => {
        if (err2) {
          res.status(200).send(`
            <!DOCTYPE html>
            <html>
              <head><title>Social Media Content Analyzer API</title></head>
              <body style="font-family: system-ui, sans-serif; padding: 40px; background: #ffffff; color: #18181b;">
                <h2>Social Media Content Analyzer API</h2>
                <p>Backend is running cleanly on port ${PORT}.</p>
                <p><a href="/api/health">Check Health Status</a></p>
              </body>
            </html>
          `);
        }
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`⚡ Server running on http://localhost:${PORT}`);
});
