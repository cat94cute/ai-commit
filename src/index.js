#!/usr/bin/env node
import chalk from 'chalk'
import { Command } from 'commander'
import Groq from 'groq-sdk'
import simpleGit from 'simple-git'
import { getApiKey, setApiKey } from './conf.js'
import { commitMessagePromptMultiple, commitMessagePromptSingle } from './prompt.js'

const program = new Command()
const git = simpleGit()

program.name('ai').version('1.0.0').description('AI commit')

program
  .command('config <apiKey>')
  .description('設定Api key')
  .action(async (apiKey) => {
    await setApiKey(apiKey)
    console.log(chalk.green(`API key 已儲存`))
  })

program
  .command('commit')
  .description('根據`git diff`內容產生適合的`commit`名稱')
  .action(async () => await main())

const MAX_CHUNK_SIZE = 40000

function splitToChunks(text, size = MAX_CHUNK_SIZE) {
  const chunks = []
  for (let i = 0; i < text.length; i += size)
    chunks.push(text.slice(i, i + size))
  return chunks
}

async function main() {
  const diff = await getDiff()
  if (!diff) {
    console.log(chalk.red('暫存區沒有變更。請先 git add 一些檔案。'))
    return
  }

  const client = new Groq({ apiKey: getApiKey() })

  const chunks = splitToChunks(diff)
  const messages = []
  if (chunks.length > 1) {
    console.log(chalk.cyan(`檔案變更較大，將內容分成 ${chunks.length} 段傳送給模型。`))

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      messages.push({
        role: 'system',
        content: commitMessagePromptMultiple(chunks.length, i + 1),
      })
      messages.push({ role: 'user', content: chunk })
      const res = await client.chat.completions.create({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'system',
            content: commitMessagePromptMultiple(chunks.length, i + 1),
          },
          {
            role: 'user',
            content: chunk,
          },
        ],
      })

      if (i < chunks.length - 1) {
        console.log(chalk.cyan(`模型回覆：${res.choices[0].message.content}`))
        // 移除 model 回覆，避免下一段被誤用
        messages.push({ role: 'assistant', content: res.choices[0].message.content })
      }
      else {
        // 最後一段，輸出 commit
        console.log(chalk.yellow(res.choices[0].message.content))
      }
    }
  }
  else {
    const res = await client.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        { role: 'system', content: commitMessagePromptSingle },
        {
          role: 'user',
          content: diff,
        },
      ],
    })

    console.log(chalk.yellow(res.choices[0].message.content))
  }
}

async function getDiff() {
  const diff = await git.diff(['--cached'])
  return diff
}

program.parse()
