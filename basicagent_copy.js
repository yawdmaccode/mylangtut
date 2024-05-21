import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

//const loader = new PDFLoader("/Users/kmccalla/software_projects/langtut/files/");




import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from 'langchain/vectorstores/memory'; // Some vector db library I want to use pinecode in the future 


import { ChatOpenAI } from "@langchain/openai";


// I want to retrieve documents properly and dynamically this is the creating and execution of the agents
import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import {createOpenAIToolsAgent, AgentExecutor} from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { pull } from "langchain/hub";

import { createRetrieverTool } from "langchain/tools/retriever";
import { AIMessage } from "@langchain/core/messages";
import { HumanMessage } from "@langchain/core/messages";


import * as dotenv  from 'dotenv';
dotenv.config();


const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.5,
    maxTokens: 1000,
    verbose: true,

});

const dirPath = "/Users//software_projects/langtut/files/"
//const filePath = "files/RTP：Audio and video for the Internet.pdf"
const directoryLoader = new DirectoryLoader(dirPath, {
    ".pdf": (path) => new PDFLoader(path),
});

const docs = await directoryLoader.load()
//console.log(docs)

/* Additional steps : Split text into chunks with any TextSplitter. You can then use it as context or save it to memory afterwards. */
const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

const splitDocs = await textSplitter.splitDocuments(docs)
//console.log({splitDocs})  


// Embeddings to embed the documents

const openAiEmbedder = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY
});


const vectorStoreDb = await MemoryVectorStore.fromDocuments(

    splitDocs,
    openAiEmbedder,
);


// Time to retrieve from the vector store and print out  the info that I am searching for.

//const retriever = new TavilySearchAPIRetriever({
 //   k: 2,
  //});


  const retriever = vectorStoreDb.asRetriever(
{ k : 2 , }

  );




  const retrieverTool = createRetrieverTool(retriever, {
    name: 'rtpinfo',
    description: "Search through documents using the LCEL search engine",
})



//create and assign tools 



const searchTool = new TavilySearchResults();

//const tools = [ retrieverTool, searchTool];
const tools = [ retrieverTool];



// Adapted from https://smith.langchain.com/hub/hwchase17/openai-tools-agent
const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are an expert RTP , sip webrtc and voice expert.  You have 150 IQ.  You will help me to troubleshoot a webrtc issue as it relates to echo. ",
    ],
    new MessagesPlaceholder("messages"),
    new MessagesPlaceholder("agent_scratchpad"),
  ]);


  
  const agent = await createOpenAIToolsAgent({
    llm : model,
    tools,
    prompt : prompt,


  });
  
  
  const agentExecutor = new AgentExecutor({

    agent: agent,
    tools,
    verbose: false,
  });


  const retrievedDocs1 =await agentExecutor.invoke({
    messages: [new HumanMessage("I'm Nemo!")],
  });


  console.log(retrievedDocs1)


  const retrievedDocs2 =await agentExecutor.invoke({
    messages: [new HumanMessage("Please show me a summary step by step. Also pelase show me how the encryption works and how the user would get the key info to decrypt the RTP info to be able to convert it to a wav file")],
  });

  console.log(retrievedDocs2);

  const retrievedDocs3 =await agentExecutor.invoke({
    messages: [new HumanMessage(" explain in great detail how frames convert to rtp")],
  });
  console.log(retrievedDocs3);


  const retrievedDocs4 =await agentExecutor.invoke({
    messages: [new HumanMessage(" explain in great detail the security portion of the rtp")],
  });
  console.log(retrievedDocs4);


  const retrievedDocs5 =await agentExecutor.invoke({
    messages: [new HumanMessage("Tell me whats in the partiful doc")],
  });
  console.log(retrievedDocs5);









  
  

