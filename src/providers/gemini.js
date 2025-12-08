import OpenAI from 'openai'
import { getApiKey } from '../conf.js'

export function createGeminiClient() {
  const apiKey = getApiKey()

  const client = new OpenAI({
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
    apiKey,
  })

  return {
    name: 'gemini',
    model: 'gemini-2.5-flash-lite',

    async chat(messages) {
      const response = await client.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.3,
      })

      return response.choices[0].message.content
    },
  }
}
