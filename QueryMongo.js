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
