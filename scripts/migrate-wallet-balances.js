const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function migrateWalletBalances() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('Error: MONGODB_URI environment variable is not defined');
    console.error('Make sure you have a .env file with MONGODB_URI defined');
    process.exit(1);
  }
  
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const usersCollection = db.collection('users');
    const walletsCollection = db.collection('wallets');
    
    // Create an index on userId for faster queries
    await walletsCollection.createIndex({ userId: 1 }, { unique: true });
    
    // Get all users with wallet balances
    const users = await usersCollection.find({
      wallet: { $exists: true }
    }).toArray();
    
    console.log(`Found ${users.length} users with wallet balances to migrate`);
    
    let migratedCount = 0;
    
    for (const user of users) {
      // Create a wallet record for each user
      try {
        await walletsCollection.insertOne({
          userId: new ObjectId(user._id),
          balance: user.wallet || 0,
          currency: user.preferredCurrency || 'USD',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        // Remove wallet field from user document (optional)
        // await usersCollection.updateOne(
        //   { _id: user._id },
        //   { $unset: { wallet: "" } }
        // );
        
        migratedCount++;
      } catch (error) {
        console.error(`Error migrating wallet for user ${user._id}:`, error);
      }
    }
    
    console.log(`Successfully migrated ${migratedCount} wallet balances`);
    
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

migrateWalletBalances().catch(console.error); 