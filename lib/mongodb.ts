import { MongoClient, Db } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local')
}

const uri = process.env.MONGODB_URI
const options = {}

interface MongoConnection {
  client: MongoClient
  db: Db
}

let cachedConnection: MongoConnection | null = null

export async function connectToDatabase(): Promise<MongoConnection> {
  if (cachedConnection) {
    return cachedConnection
  }

  try {
    const client = await MongoClient.connect(uri, options)
    const db = client.db()

    cachedConnection = { client, db }
    return cachedConnection
  } catch (error) {
    console.error('Failed to connect to database:', error)
    throw new Error('Failed to connect to database')
  }
} 