const { MongoClient } = require('mongodb');
const { mongoDbUri, mongoDbDatabase } = require('../../config.js');

let db;

async function connectToDB() {
  try {
    const client = new MongoClient(mongoDbUri);
    await client.connect();
    console.log('Connected to MongoDB');

    db = client.db(mongoDbDatabase);
    await setupDB(db);
  } catch (err) {
    console.error("Could not connect to MongoDB", err);
    process.exit(1); // Exit in case of connection error
  }
}

async function setupDB(db) {
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // Users - collection
    if (!collectionNames.includes('users')) {
        await db.createCollection("users");
        console.log("Collection 'users' created");
    }

    // Users - indexes
    await db.collection("users").createIndex({ "email": 1 }, { unique: true });
    await db.collection("users").createIndex({ "guid": 1 }, { unique: true });
    console.log("Unique indexes added on 'email' and 'guid'");
}

function getDB() {
    return db;
}

module.exports = { connectToDB, getDB };
