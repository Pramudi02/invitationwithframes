import { MongoClient } from 'mongodb';

let client;
let clientPromise;

/**
 * Returns a MongoClient promise.
 * Throws at request-time (not import-time) if MONGODB_URI is not set,
 * which allows `next build` to succeed without env vars.
 */
export default function getMongoClientPromise() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined. Please set it in your .env.local file.');
  }

  if (clientPromise) return clientPromise;

  if (process.env.NODE_ENV === 'development') {
    // Reuse connection across HMR reloads in development
    if (!global._mongoClientPromise) {
      client = new MongoClient(process.env.MONGODB_URI);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(process.env.MONGODB_URI);
    clientPromise = client.connect();
  }

  return clientPromise;
}
