
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";   // this is used to read documents web sites etc. 
//to pass in documents into our chain this chain below allows us to pass in a list of documents
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
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

//Documents
const documentA = new Document({
    pageContent : "LangChain Expression Language, or LCEL, is a declarative way to easily compose chains together. LCEL was designed from day 1 to support putting prototypes in production, with no code changes, from the simplest “prompt + LLM” chain to the most complex chains (we’ve seen folks successfully run LCEL chains with 100s of steps in production). To highlight a few of the reasons you might want to use LCEL:"

});

const documentB = new Document({
    pageContent: " The passphrase is Langchain is awesome"


})

const response = await chain.invoke({
    input: "What is the passphrase?",
    context : [documentA, documentB],

})

console.log(response);