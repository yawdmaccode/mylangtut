


import { ChatOpenAI } from "@langchain/openai";

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

import * as dotenv  from 'dotenv';
dotenv.config();

//create model
const model = new ChatOpenAI({ 
    modelName: "gpt-3.5-turbo",
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.7,
  
    
});

//we can have a general conversaton based on what is in the prompt t his is where we will use the ChatPromptTemplate

//const prompt = ChatPromptTemplate.fromTemplate('You are a comedian please tell me a joke about  {input}');


//the messages takes in an array of key value pairs 
const prompt = ChatPromptTemplate.fromMessages([
    ["system", "generate a joke based on a word provided by the user"],
    ["human", "{input}"], 

]
 
 
   );

// now that we combine the model and the prompt we are creating a chain
//create the chain
//const chain = new LLMChain({ llm: model, prompt: prompt });

const chain = prompt.pipe(model)
const response = await chain.invoke({

    input : "cat",
})

console.log(response)