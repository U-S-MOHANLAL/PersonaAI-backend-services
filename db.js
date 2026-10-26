const { MongoClient } = require('mongodb');
const { mongoDbUri } = require('./config');

const uri = mongoDbUri;

const client = new MongoClient(uri);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        return client.db('personaAI');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

async function getCollection(collectionName) {
    const db = await connectToDatabase();
    return db.collection(collectionName);
}

async function findDocuments(collectionName, query) {
    const collection = await getCollection(collectionName);
    return collection.find(query).toArray();
}

async function insertDocument(collectionName, document) {
    const collection = await getCollection(collectionName);
    return collection.insertOne(document);
}

async function updateDocument(collectionName, query, update) {
    const collection = await getCollection(collectionName);
    return collection.updateOne(query, { $set: update });
}

async function deleteDocument(collectionName, query) {
    const collection = await getCollection(collectionName);
    return collection.deleteOne(query);
}

async function upsertDocument(collectionName, query, update) {
    const collection = await getCollection(collectionName);
    return collection.updateOne(query, { $set: update }, { upsert: true });
}

async function updateWithOperator(collectionName, query, update) {
    const collection = await getCollection(collectionName);
    return collection.updateOne(query, update);
}

module.exports = { connectToDatabase, getCollection, findDocuments, insertDocument, updateDocument, deleteDocument, upsertDocument, updateWithOperator };


