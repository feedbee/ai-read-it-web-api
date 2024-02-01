const { getDB } = require('../util/db');
const { v4: uuidv4 } = require('uuid');

async function addUser(userData) {
    const db = getDB();

    userData.guid = uuidv4();
    try {
        const result = await db.collection('users').insertOne(userData);
        return result;
    } catch (error) {
        // Handle potential errors, like duplicate entries due to unique constraints
        throw error;
    }
}

function getUserByEmail(email) {
    const db = getDB();
    return db.collection('users').findOne({ email });
}

module.exports = { getUserByEmail, addUser };
