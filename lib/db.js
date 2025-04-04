import { MongoClient, ObjectId } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongodb URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export const getCollection = async (collectionName) => {
  const client = await clientPromise;
  return client.db().collection(collectionName);
};

// Collection schemas for reference
export const schemas = {
  djs: {
    _id: ObjectId,
    name: String,
    genre: String,
    location: String,
    imageUrl: String,
    bio: String,
    rating: Number,
    createdAt: Date,
    updatedAt: Date,
    // Indexes:
    // { name: 1 }
    // { genre: 1 }
  },
  favorites: {
    _id: ObjectId,
    clerkId: String,
    djId: ObjectId,
    createdAt: Date,
    // Indexes:
    // { clerkId: 1, djId: 1 }, unique: true
    // { djId: 1 }
  },
  songs: {
    _id: ObjectId,
    spotifyId: String,
    title: String,
    artist: String,
    album: String,
    albumArt: String,
    duration_ms: Number,
    explicit: Boolean,
    createdAt: Date,
    updatedAt: Date,
    // Indexes:
    // { title: 1 }
    // { artist: 1 }
    // { spotifyId: 1 }, unique: true
  },
  bids: {
    _id: ObjectId,
    clerkId: String,
    songId: ObjectId,
    djId: ObjectId,
    amount: Number,
    status: String, // PENDING, ACCEPTED, PLAYING, NEXT, COMPLETED, REJECTED
    createdAt: Date,
    updatedAt: Date,
    // Indexes:
    // { clerkId: 1 }
    // { songId: 1 }
    // { djId: 1 }
    // { status: 1 }
  }
};

// Helper function to create indexes
export const createIndexes = async () => {
  const djs = await getCollection('djs');
  const favorites = await getCollection('favorites');

  // Create indexes for djs collection
  await djs.createIndex({ name: 1 });
  await djs.createIndex({ genre: 1 });

  // Create indexes for favorites collection
  await favorites.createIndex({ clerkId: 1, djId: 1 }, { unique: true });
  await favorites.createIndex({ djId: 1 });
};

// Helper function to format DJ document
export const formatDJ = (dj) => ({
  id: dj._id.toString(),
  name: dj.name,
  genre: dj.genre,
  location: dj.location,
  imageUrl: dj.imageUrl,
  bio: dj.bio,
  rating: dj.rating,
  createdAt: dj.createdAt,
  updatedAt: dj.updatedAt
});

export default clientPromise; 