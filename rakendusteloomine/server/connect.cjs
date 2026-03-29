const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

console.log('Connect.cjs - ATLAS_URI:', process.env.ATLAS_URI ? 'Set' : 'Not set');

let client;

async function connectToDatabase() {
    if (!client) {
        client = new MongoClient(process.env.ATLAS_URI, {
            tls: true,
            tlsAllowInvalidCertificates: false,
        });
        try {
            await client.connect();
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('MongoDB connection error:', error);
            throw error;
        }
    }
    return client.db("FilmiRiiul");
}

async function closeDatabaseConnection() {
    if (client) {
        await client.close();
        client = null;
        console.log('Database connection closed');
    }
}

module.exports = { connectToDatabase, closeDatabaseConnection };