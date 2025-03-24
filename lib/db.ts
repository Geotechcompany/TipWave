import clientPromise from './mongodb'

export async function getCollection(collectionName: string) {
  const client = await clientPromise
  const db = client.db('djtipsync') // Your database name
  
  // This will create the collection if it doesn't exist
  const collections = await db.listCollections().toArray()
  if (!collections.find(c => c.name === collectionName)) {
    await db.createCollection(collectionName)
  }
  
  return db.collection(collectionName)
} 