


import { ChatOpenAI } from "@langchain/openai";

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser, CommaSeparatedListOutputParser, StructuredOutputParser } from "@langchain/core/output_parsers";
import {z} from "zod";
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
async function callStringOutputParser() {

//the messages takes in an array of key value pairs 
const prompt = ChatPromptTemplate.fromMessages([
    ["system", "generate a joke based on a word provided by the user"],
    ["human", "{input}"], 

]
 
 
   );

   const outputParser = new StringOutputParser();
// now that we combine the model and the prompt we are creating a chain
//create the chain
//const chain = new LLMChain({ llm: model, prompt: prompt });

const chain = prompt.pipe(model).pipe(outputParser);
 return await chain.invoke({

    input : "dog",
})
}


async function callListOutputParser() {
    
    const prompt = ChatPromptTemplate.fromTemplate(

        `Provide 5 synonyms , seperated by commas , for the following word {word}`
    );
    const outputParser = new CommaSeparatedListOutputParser();
    const chain = prompt.pipe(model).pipe(outputParser);
    return await chain.invoke({word : "happy"})

}



async function CallZodParser(){
    const prompt = ChatPromptTemplate.fromTemplate(
        `Extract information from the  following phrase.  
        Formatting Instructions: {format_instructions}
        Phrase: {phrase}`
       
    );
    const outputParser = StructuredOutputParser.fromZodSchema(
        z.object({
            recipe: z.string().describe("name of recipe"), 
            ingredients: z.array(z.string()).describe("ingredients"),
          //  instructions: z.string().describe("instructions for making the recipe"),
        })
    );
    const chain = prompt.pipe(model).pipe(outputParser);
    return await chain.invoke({
        phrase : "make a salad with chicken",
        format_instructions : outputParser.getFormatInstructions(),
    
    })
}



//const response = await callStringOutputParser();
//const response = await callListOutputParser();
const response = await CallZodParser();
console.log(response)