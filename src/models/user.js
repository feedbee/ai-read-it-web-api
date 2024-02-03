const { getDB } = require('../util/db');
const { v4: uuidv4 } = require('uuid');

async function addUser(userData) {
    const db = getDB();

    userData.guid = uuidv4();
    userData.charactersCredit = 20000; // TODO: move to config as initialCharactersCredit
    try {
        const result = await db.collection('users').insertOne(userData);
        return result;
    } catch (error) {
        // Handle potential errors, like duplicate entries due to unique constraints
        throw error;
    }
}

async function getUserByEmail(email) {
    const db = getDB();
    return await db.collection('users').findOne({ email });
}

async function debitUserCharactersBalance(user, amount) {
    const db = getDB();

    try {
        // Attempt to update the user's balance atomically
        const result = await db.collection('users').findOneAndUpdate(
            { _id: user._id, charactersCredit: { $gte: amount } }, // Condition: user exists and balance is sufficient
            { $inc: { charactersCredit: -amount } }, // Action: deduct the amount
            { returnDocument: 'after' } // Options: return the updated document
        );

        if (result) {
            console.info("Balance updated debited for user", user.email, "for amount", result.charactersCredit);
            return true;
        } else {
            console.info("Not enough funds or user not found.");
            return false;
        }
    } catch (error) {
        console.error("Error during the balance deduction operation:", error);
        return false;
    }
}

module.exports = { getUserByEmail, addUser, debitUserCharactersBalance };
