import { createIndexes } from '../lib/db';

async function init() {
  try {
    await createIndexes();
    console.log('Database indexes created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

init(); 