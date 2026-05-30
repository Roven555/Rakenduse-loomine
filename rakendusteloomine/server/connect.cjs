const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

console.log('Connect.cjs - ATLAS_URI:', process.env.ATLAS_URI ? 'Set' : 'Not set');

let client;
let inMemoryDb;

function createInMemoryDatabase() {
    const collections = { users: [] };

    const matches = (doc, query) => {
        return Object.keys(query).every(key => {
            const value = query[key];
            if (key === '_id') {
                if (!doc._id) return false;
                if (typeof value === 'object' && typeof doc._id === 'object' && typeof doc._id.equals === 'function') {
                    return doc._id.equals(value);
                }
                return doc._id.toString() === value.toString();
            }
            return doc[key] === value;
        });
    };

    const project = (doc, projection) => {
        if (!projection) return doc;
        const result = {};
        const include = Object.values(projection).some(value => value === 1);
        if (include) {
            for (const key in projection) {
                if (projection[key] === 1 && key in doc) {
                    result[key] = doc[key];
                }
            }
        } else {
            Object.assign(result, doc);
            for (const key in projection) {
                if (projection[key] === 0) {
                    delete result[key];
                }
            }
        }
        return result;
    };

    return {
        collection(name) {
            if (!collections[name]) {
                collections[name] = [];
            }
            const docs = collections[name];
            return {
                findOne: async (query, options = {}) => {
                    const doc = docs.find(item => matches(item, query));
                    if (!doc) return null;
                    return project(doc, options.projection);
                },
                insertOne: async (document) => {
                    const stored = { ...document, _id: document._id || new ObjectId() };
                    docs.push(stored);
                    return { insertedId: stored._id };
                },
                updateOne: async (filter, update) => {
                    const index = docs.findIndex(item => matches(item, filter));
                    if (index === -1) {
                        return { matchedCount: 0, modifiedCount: 0 };
                    }
                    const existing = docs[index];
                    if (update.$set) {
                        docs[index] = { ...existing, ...update.$set };
                    }
                    return { matchedCount: 1, modifiedCount: 1 };
                }
            };
        }
    };
}

async function connectToDatabase() {
    if (!client && !inMemoryDb) {
        const atlasUri = process.env.ATLAS_URI;
        if (atlasUri) {
            client = new MongoClient(atlasUri, {
                tls: true,
                tlsAllowInvalidCertificates: true,
            });
            try {
                await client.connect();
                console.log('Connected to MongoDB Atlas');
                return client.db('FilmiRiiul');
            } catch (error) {
                console.error('MongoDB Atlas connection error:', error.message || error);
                console.log('Falling back to in-memory database for local development.');
                client = null;
            }
        }

        inMemoryDb = createInMemoryDatabase();
        console.log('Using in-memory MongoDB fallback. Data will not persist after restart.');
    }

    return client ? client.db('FilmiRiiul') : inMemoryDb;
}

async function closeDatabaseConnection() {
    if (client) {
        await client.close();
        client = null;
        console.log('Database connection closed');
    }
    inMemoryDb = null;
}

module.exports = { connectToDatabase, closeDatabaseConnection };
