#!/usr/bin/env node
import { select } from '@inquirer/prompts'
import chalk from 'chalk'
import { Command } from 'commander'
import simpleGit from 'simple-git'
import { getProvider, setApiKey, setProvider } from './conf.js'
import { API_PROVIDERS } from './const/index.js'
import { commitMessagePromptMultiple, commitMessagePromptSingle } from './prompt.js'
import { createDeepSeekClient } from './providers/deepseek.js'
import { createGeminiClient } from './providers/gemini.js'
import { createGroqClient } from './providers/groq.js'

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
  .command('config-provider')
  .description('設定API提供者，目前僅支援 Groq')
  .action(async () => {
    const selects = API_PROVIDERS.map(provider => ({
      name: provider.name,
      value: provider.value,
    }))
    const answer = await select({
      message: '請選擇 AI Provider：',
      choices: selects,
    })
    setProvider(answer)
    console.log(answer)
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

  const provider = getProvider()
  let client
  switch (provider) {
    case 'groq':
      client = await createGroqClient()
      break
    case 'gemini':
      client = await createGeminiClient()
      break
    case 'openai':
      throw new Error('OpenAI 尚未實作')
    case 'deepseek':
      client = await createDeepSeekClient()
      break
    default:
      throw new Error('不支援的提供者')
  }

  const chunks = splitToChunks(diff)
  let finalMessage = ''
  if (chunks.length > 1) {
    console.log(chalk.cyan(`檔案變更較大，將內容分成 ${chunks.length} 段傳送給模型。`))

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const messages = [
        {
          role: 'system',
          content: commitMessagePromptMultiple(chunks.length, i + 1),
        },
        {
          role: 'user',
          content: chunk,
        },
      ]
      const result = await client.chat(messages)

      if (i < chunks.length - 1) {
        console.log(chalk.cyan(`模型回覆：${result}`))
      }
      else {
        console.log(chalk.yellow(result))
      }
    }
  }
  else {
    const messages = [
      { role: 'system', content: commitMessagePromptSingle },
      {
        role: 'user',
        content: diff,
      },
    ]
    const result = await client.chat(messages)
    console.log(chalk.yellow(result))
    finalMessage = result
  }

  const answer = await confirmCommit(finalMessage)
  if (answer) {
    await git.commit(finalMessage)
    console.log(chalk.green('Commit 已建立 🎉'))
  }
  else {
    console.log(chalk.yellow('已取消 commit'))
  }
}

async function getDiff() {
  const diff = await git.diff(['--cached'])
  return diff
}

async function confirmCommit() {
  const answer = await select({
    type: 'list',
    message: `你要使用這個 commit message 嗎？`,
    choices: [
      { name: '是，建立 commit', value: true },
      { name: '否，取消', value: false },
    ],
  })
  return answer
}

program.parse()
