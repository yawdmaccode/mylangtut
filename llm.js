
import * as dotenv from "dotenv";
dotenv.config();
import { ChatOpenAI } from "@langchain/openai"

const model = new ChatOpenAI({ 
    modelName: "gpt-3.5-turbo",
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.5,
    maxTokens: 1000,
    verbose: true,

})

const response = await model.invoke('Write a poem about AI');
console.log(response)


