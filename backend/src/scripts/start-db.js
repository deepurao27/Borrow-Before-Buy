import EmbeddedPostgres from 'embedded-postgres';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startDb() {
  const dbPath = path.resolve(__dirname, '../../.pgdata');
  const pg = new EmbeddedPostgres({
    port: 5432,
    databaseDir: dbPath,
    user: 'postgres',
    password: 'password',
    persistent: true
  });

  try {
    console.log('Initialising Embedded Postgres database at', dbPath);
    await pg.initialise();
    console.log('Starting Postgres on port 5432...');
    await pg.start();
    console.log('PostgreSQL is running on localhost:5432');
    
    // Create bbb_db if not exists
    try {
      await pg.createDatabase('bbb_db');
      console.log('Created database bbb_db');
    } catch (e) {
      console.log('Database bbb_db already exists or ready');
    }

    // Keep process alive
    setInterval(() => {}, 1000);
  } catch (err) {
    console.log('Initialise failed or already exists, trying to start directly...');
    try {
      await pg.start();
      console.log('PostgreSQL started on localhost:5432');
      setInterval(() => {}, 1000);
    } catch (e) {
      console.error('Fatal error starting PostgreSQL:', e);
      process.exit(1);
    }
  }
}

startDb();
