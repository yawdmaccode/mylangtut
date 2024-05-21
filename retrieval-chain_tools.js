
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


import * as dotenv  from 'dotenv';
dotenv.config();

const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.5,
    maxTokens: 1000,
    verbose: true,

});

const prompt = ChatPromptTemplate.fromTemplate(`
Answer the users question . 

Context : {context}
Question: {input}

`);

//const chain = prompt.pipe(model);

const chain = await createStuffDocumentsChain(
    {
        llm : model, 
        prompt : prompt,
    }
);

//********************************************************* */
//**********************Load data from website ******/
//********************************************************* */

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



//************************************************************* */
//**********************Retrieve from vector store ******/
//************************************************************* */


const retriever = vectorStore.asRetriever({

    k: 2,
});


const retrievalChain = await createRetrievalChain({

    combineDocsChain: chain,
    retriever ,
})


const response = await retrievalChain.invoke({
    input: "What is LECL?",

    
    

})

console.log(response);