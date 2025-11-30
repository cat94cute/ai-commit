import OpenAI from 'openai';
import Groq from "groq-sdk";
import dotenv from "dotenv";
import simpleGit from "simple-git";

dotenv.config();

// const client = new OpenAI({
//   apiKey: process.env['OPENAPI_SECRET_KEY'], // This is the default and can be omitted
// });
const git = simpleGit();
const client = new Groq({ apiKey: process.env.GROQ_SECRET_KEY });

async function main() {
  const res = await client.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      { role: "user", content: "甚麼是巧克力生乳派" }
    ],
  });

  console.log(res.choices[0].message.content);
}

async function run() {
  const diff = await git.diff(["--cached"]);
  console.log('123', diff);
  
}

// main();
run();
  
// const response = await client.responses.create({
//   model: 'gpt-4o',
//   instructions: 'You are a coding assistant that talks like a pirate',
//   input: 'Are semicolons optional in JavaScript?',
// });

// console.log(response.output_text);
