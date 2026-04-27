// One-time migration: Add type='expense' to all existing Expense documents
// and transfer them to the Transaction collection

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Check if old 'expenses' collection exists
    const collections = await db.listCollections({ name: 'expenses' }).toArray();

    if (collections.length > 0) {
      // Update all documents in expenses collection to have type: 'expense'
      const result = await db.collection('expenses').updateMany(
        { type: { $exists: false } },
        { $set: { type: 'expense' } }
      );
      console.log(`Updated ${result.modifiedCount} existing expense records with type='expense'`);

      // Rename collection to transactions
      try {
        await db.collection('expenses').rename('transactions');
        console.log('Renamed expenses collection to transactions');
      } catch (e) {
        if (e.codeName === 'NamespaceExists') {
          // transactions collection already exists, merge
          const docs = await db.collection('expenses').find({}).toArray();
          if (docs.length > 0) {
            await db.collection('transactions').insertMany(docs);
            await db.collection('expenses').drop();
            console.log(`Merged ${docs.length} docs into transactions and dropped expenses`);
          }
        } else {
          throw e;
        }
      }
    } else {
      console.log('No expenses collection found, nothing to migrate');
    }

    // Ensure type field exists on all transaction docs
    const txResult = await db.collection('transactions').updateMany(
      { type: { $exists: false } },
      { $set: { type: 'expense' } }
    );
    if (txResult.modifiedCount > 0) {
      console.log(`Set type='expense' on ${txResult.modifiedCount} transaction records`);
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
