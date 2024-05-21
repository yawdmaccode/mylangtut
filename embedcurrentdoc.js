import { formatDocumentsAsString } from "langchain/util/document";
import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";

import { OpenAIEmbeddings,  ChatOpenAI } from "@langchain/openai";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

import { PromptTemplate } from "@langchain/core/prompts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import * as fs from 'fs';


import * as dotenv  from 'dotenv';
import connectDB  from "./db/db.js"

dotenv.config();
//connectDB();

const embeddings = await new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY
});


//console.log(embedding)
const client = new MongoClient('mongodb://root:root@localhost:27778/?directConnection=true'); // Replace with your MongoDB connection string
//console.log("connected to ", client)


const dbName = "Apartments"
const collectionName = "location"
const collection = client.db(dbName).collection(collectionName);
console.log(collection)

// Function to create embedding
const createEmbedding = async (text) => {
    if (!text || typeof text !== 'string') {
      return null;
    }
    try {
      const embeddingResponse = await embeddings.embedQuery(text);
      return embeddingResponse;
    } catch (error) {
      console.error("Error in createEmbedding:", error);
      return null;
    }
  };

  const updateExistingDocuments = async () => {
    try {
      await client.connect();
      const database = client.db(dbName);
      const collection = database.collection(collectionName);


         // Create a cursor to find all documents without the embedding field
      const cursor = collection.find({ embedding: { $exists: false } });
  
         // Iterate over each document using the cursor
      while (await cursor.hasNext()) {
        const document  = await cursor.next();

         // Generate the embedding for the document's description
        const embedding = await createEmbedding(document.description);

        // If embedding is successfully generated, update the document
        if (embedding) {
          await collection.updateOne(
            { _id: document._id },
            { $set: { embedding } }
          );
          console.log("Updated document:", document._id);
        }
      }
    } finally {
      await client.close(); // Ensure the client is closed after the operation
    }
  };
  

updateExistingDocuments()
