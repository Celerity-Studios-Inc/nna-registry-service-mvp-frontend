#!/usr/bin/env node

/**
 * Simple MongoDB migration script for NNA Registry Service
 * 
 * Usage:
 * node scripts/migrate.js [command]
 * 
 * Commands:
 * - status: Show migration status
 * - up: Run pending migrations
 * - down: Rollback last migration
 * - create [name]: Create a new migration file
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const migrationsDir = path.join(__dirname, '../migrations');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nna-registry';

// Ensure migrations directory exists
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

// Connect to MongoDB
async function connectToMongo() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  // Ensure migrations collection exists
  if (!(await db.listCollections({ name: 'migrations' }).toArray()).length) {
    await db.createCollection('migrations');
  }
  
  return { client, db };
}

// Get all migration files
function getMigrationFiles() {
  return fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.js'))
    .sort();
}

// Get applied migrations
async function getAppliedMigrations(db) {
  const migrations = await db.collection('migrations')
    .find({})
    .sort({ timestamp: 1 })
    .toArray();
  
  return migrations.map(m => m.name);
}

// Create a new migration file
function createMigration(name) {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  const filename = `${timestamp}_${name}.js`;
  const filePath = path.join(migrationsDir, filename);
  
  const template = `/**
 * Migration: ${name}
 * Created at: ${new Date().toISOString()}
 */

module.exports = {
  async up(db) {
    // TODO: implement migration
    // Example: await db.collection('assets').updateMany({}, { $set: { newField: 'value' } });
  },
  
  async down(db) {
    // TODO: implement rollback
    // Example: await db.collection('assets').updateMany({}, { $unset: { newField: '' } });
  }
};
`;

  fs.writeFileSync(filePath, template);
  console.log(`Created migration file: ${filename}`);
}

// Show migration status
async function showStatus() {
  const { client, db } = await connectToMongo();
  try {
    const files = getMigrationFiles();
    const applied = await getAppliedMigrations(db);
    
    console.log('Migration Status:');
    console.log('=================');
    
    files.forEach(file => {
      const status = applied.includes(file) ? '✓ Applied' : '✗ Pending';
      console.log(`${status} | ${file}`);
    });
    
    console.log('\nTotal:', files.length);
    console.log('Applied:', applied.length);
    console.log('Pending:', files.length - applied.length);
  } finally {
    await client.close();
  }
}

// Run pending migrations
async function runMigrations() {
  const { client, db } = await connectToMongo();
  try {
    const files = getMigrationFiles();
    const applied = await getAppliedMigrations(db);
    const pending = files.filter(file => !applied.includes(file));
    
    if (pending.length === 0) {
      console.log('No pending migrations');
      return;
    }
    
    console.log(`Running ${pending.length} migrations:`);
    
    for (const file of pending) {
      try {
        console.log(`Applying: ${file}`);
        const migration = require(path.join(migrationsDir, file));
        await migration.up(db);
        
        await db.collection('migrations').insertOne({
          name: file,
          timestamp: new Date(),
          success: true
        });
        
        console.log(`✓ Applied: ${file}`);
      } catch (error) {
        console.error(`✗ Failed: ${file}`);
        console.error(error);
        break;
      }
    }
  } finally {
    await client.close();
  }
}

// Rollback last migration
async function rollbackMigration() {
  const { client, db } = await connectToMongo();
  try {
    const applied = await getAppliedMigrations(db);
    
    if (applied.length === 0) {
      console.log('No migrations to rollback');
      return;
    }
    
    const lastMigration = applied[applied.length - 1];
    console.log(`Rolling back migration: ${lastMigration}`);
    
    try {
      const migration = require(path.join(migrationsDir, lastMigration));
      await migration.down(db);
      
      await db.collection('migrations').deleteOne({ name: lastMigration });
      
      console.log(`✓ Rolled back: ${lastMigration}`);
    } catch (error) {
      console.error(`✗ Failed to rollback: ${lastMigration}`);
      console.error(error);
    }
  } finally {
    await client.close();
  }
}

// Process command line arguments
async function main() {
  const [,, command, ...args] = process.argv;
  
  switch (command) {
    case 'status':
      await showStatus();
      break;
    case 'up':
      await runMigrations();
      break;
    case 'down':
      await rollbackMigration();
      break;
    case 'create':
      if (args.length === 0) {
        console.error('Missing migration name. Usage: node migrate.js create <name>');
        process.exit(1);
      }
      createMigration(args[0]);
      break;
    default:
      console.log('NNA Registry Service Migration Tool');
      console.log('Usage: node migrate.js [command]');
      console.log('\nCommands:');
      console.log('  status       Show migration status');
      console.log('  up           Run pending migrations');
      console.log('  down         Rollback last migration');
      console.log('  create NAME  Create a new migration file');
  }
}

// Run the main function
main().catch(console.error);