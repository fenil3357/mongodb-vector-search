import OpenAI from "openai";
import * as dotenv from 'dotenv'
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export const generateEmbeddings = async (content) => {
  try {
    const res = await openai.embeddings.create({
      input: content,
      model: 'text-embedding-ada-002'
    })
    return res.data[0].embedding;
  }
  catch (error) {
    console.log('Error while generating embeddings', error);
    throw error;
  }
}