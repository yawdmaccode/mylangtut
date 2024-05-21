import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { Document } from "@langchain/core/documents";   // this is used to read documents web sites etc. 
//to pass in documents into our chain this chain below allows us to pass in a list of documents
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

import { createRetrievalChain } from "langchain/chains/retrieval";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

import { MessagesPlaceholder } from "@langchain/core/prompts";
import { AIMessage , HumanMessage} from '@langchain/core/messages'

import {createHistoryAwareRetriever} from 'langchain/chains/history_aware_retriever'

//Import env variables from .env
import * as dotenv  from 'dotenv';
dotenv.config();



//************** Function to create the retreival chain and vector store ******************    */

const createChain = async () => {

    //instantiate the model
const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.5,
    maxTokens: 1000,
    verbose: true,

});

const prompt = ChatPromptTemplate.fromMessages([
    ["system", "Answer the users questions based on the following context: {context}"],
    new MessagesPlaceholder("chat_history"),
    ["user", "{input}"]
]
);


const chain = await createStuffDocumentsChain(
    {
        llm : model, 
        prompt : prompt,
    }
);


const retriever = vectorStore.asRetriever({

    k: 2,
});

const retrieverPrompt = ChatPromptTemplate.fromMessages([

    new MessagesPlaceholder("chat_history"),
    ["user", "{input}"],
    ["user", " Given the above conversation generate a search query to look up in order the get the information relevant to the conversation"],
])

const historyAwareRetriever = await createHistoryAwareRetriever({
    llm: model,
    retriever : retriever,
    rephrasePrompt: retrieverPrompt,
})


const conversationChain = await createRetrievalChain({

    combineDocsChain: chain,
    retriever: historyAwareRetriever,
});


return conversationChain

};


//********************************************************* */
//**********************Load data from website *************/
//********************************************************* */



const createVectorStore = async () => {

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
    
    return vectorStore;

}




//************************************************************* */
//**********************Retrieve from vector store ******/
//************************************************************* */

const vectorStore = await createVectorStore();
const  chain = await createChain();



//chat History
const chatHistory = [
    new HumanMessage("hello"),
new AIMessage("hi, how can I help you"),
new HumanMessage(" Hi My name is Kirk "),
new AIMessage("hello, Kirk it is nice to meet you, how can I help you"), 
new HumanMessage("What is LECL?"),
new AIMessage("LECL stands for  Lang Chain Expression Language")   
]

const response = await chain.invoke({
    input: "What is my name?",
   
    chat_history: chatHistory,

    
    

})

console.log(response);