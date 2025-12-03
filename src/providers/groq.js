import Groq from 'groq-sdk'
import { getApiKey } from '../conf.js'

export function createGroqClient() {
  const apiKey = getApiKey()
  const client = new Groq({ apiKey })

  return {
    name: 'groq',
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    async chat(prompt) {
      const response = await client.chat.completions.create({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: prompt,
        temperature: 0.3,
      })

      return response.choices[0].message.content
    },
  }
}
