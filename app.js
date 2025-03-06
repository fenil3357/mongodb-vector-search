import express from "express";
import connectDB from "./connectDB.js";
import * as dotenv from 'dotenv'

import { generateEmbeddings } from "./openai.js";
import ContentModel from "./content.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3030;
app.use(express.json({
  limit: '50mb'
}));

app.post('/content', async (req, res) => {
  try {
    const { data } = req?.body;

    for (let i = 0; i < data?.length; i++) {
      const vector = await generateEmbeddings(data[i]?.text);
      const content = new ContentModel({
        text: data[i]?.text,
        vector
      });
      await content.save();
    }
    return res.json({ message: 'Vectors created successfully!' });
  } catch (error) {
    console.log("🚀 ~ app.post ~ error:", error)
    return res.status(500).json(error);
  }
})

app.post('/search', async (req, res) => {
  try {
    const { query, k = 5 } = req?.body;

    const queryVector = await generateEmbeddings(query);

    const results = await ContentModel.aggregate([
      {
        $vectorSearch: {
          index: 'vector-search-index',
          path: 'vector',
          queryVector,
          numCandidates: 100,
          limit: k,
        }
      },
      {
        $project: {
          _id: 1,
          text: 1,
          score: {
            $meta: 'vectorSearchScore'
          }
        }
      }
    ]);

    // Generate answer with AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash'
    });
    const prompt = `
    Provide answer of my question based on given text provided.
    Question : ${query},
    Text : ${results.map(r => r.text).join('. ')}.
    Please provide answer in proper markdown format, Use bullet points if required.
    `;

    const result = await model.generateContentStream(prompt);
    res.setHeader("Content-Type", "text/plain");

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        res.write(text);
      }
    }
    return res.end();
  } catch (error) {
    console.log("🚀 ~ app.get ~ error:", error)
    return res.status(500).json(error);
  }
})

app.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.log("🚀 ~ app.listen ~ error:", error)
    process.exit(1);
  }
})