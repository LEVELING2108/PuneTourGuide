import app from './app';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
  console.log(`Tour API listening on port ${env.PORT}`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Fatal] Port ${env.PORT} is already in use. Stop the other process first.`);
  } else {
    console.error('[Server Error]:', err);
  }
  process.exit(1);
});
