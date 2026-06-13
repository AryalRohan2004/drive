import app from './app.js';
import { env } from './config/env.js';
import { disconnectDatabase, initializeDatabase } from './config/db.js';

async function start() {
  await initializeDatabase();

  app.listen(env.port, () => {
    console.log(`SANOS backend listening on port ${env.port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  disconnectDatabase().finally(() => process.exit(1));
});
