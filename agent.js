import * as dotev from 'dotenv';
dotev.config();
import { ChatOpenAI } from '@langchain/openai'; 
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'; 


import {createOpenAIFunctionsAgent, AgentExecutor} from 'langchain/agents';
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

import readline from "readline";

import { AIMessage, HumanMessage } from '@langchain/core/messages';



import {createRetrieverTool} from 'langchain/tools/retriever'
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from 'langchain/vectorstores/memory';







//************** Function to create the agent ****************** */

const loader = new CheerioWebBaseLoader(
    
    "https://python.langchain.com/docs/expression_language/"

   
);



const docs = await loader.load()
//console.log(docs)


const splitter = new RecursiveCharacterTextSplitter({
    chunksize : 200,
    chunkOverlap : 20,
});

const splitDocs = await splitter.splitDocuments(docs)
//console.log(splitDocs);

const embeddings = new OpenAIEmbeddings();


const vectorStore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings,

);



//************************************************************* 
//**********************Retrieve from vector store ******/
//************************************************************* 


const retriever = vectorStore.asRetriever({

    k: 2,
});



//********* adding memory via retriever ******

const model = new ChatOpenAI({
    modelName : "gpt-3.5-turbo",
    temperature: 0.7,
    openAIApiKey: process.env.OPENAI_API_KEY,
});


const prompt = ChatPromptTemplate.fromMessages([
    
    
    ("system", "You are a helpful assistant called max"),
    new MessagesPlaceholder("chat_history"),
    ("human", "{input}"),
    new MessagesPlaceholder("agent_scratchpad")
    
]);


//create and assign tools 
const searchTool = new TavilySearchResults();
const retrieverTool = createRetrieverTool(retriever, {
    name: 'lcel_search',
    description: "Search through documents using the LCEL search engine",
})


const tools = [searchTool, retrieverTool];


//create agent
const agent =  await createOpenAIFunctionsAgent({

    llm : model,
    prompt : prompt,
    tools ,
});

//create Agent executor

const agentExecutor = new AgentExecutor({

    agent : agent,
    tools,
    verbose : true,
})


const chatHistory = [];

//get user input

const rl = readline.createInterface({
    input : process.stdin,
    output : process.stdout,
});




const askQuestion = () => { 


    rl.question("User:  ", async (input) => {

        if(input.toLocaleLowerCase() === "exit") {
            rl.close()
            return
        }

        //call the agent 
        
        const response = await agentExecutor.invoke({
        
        
            input : input,
            chat_history : chatHistory,
            
            })
            
            console.log("Agent :  ",response.output);
            chatHistory.push(new HumanMessage(input));
            chatHistory.push(new AIMessage(response.output))  // adding conversation history
            
            askQuestion()
        
        })


} ;  


askQuestion();














