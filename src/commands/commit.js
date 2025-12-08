import { select } from '@inquirer/prompts'
import chalk from 'chalk'
import { getProvider } from '../conf.js'
import { commitMessagePromptMultiple, commitMessagePromptSingle } from '../prompt.js'
import { createDeepSeekClient } from '../providers/deepseek.js'
import { createGeminiClient } from '../providers/gemini.js'
import { createGroqClient } from '../providers/groq.js'
import { delay } from '../utils/common.js'
import { gitCommit, gitDiff } from '../utils/gitTools.js'

export default function registerCommitCommand(program) {
  program
    .command('commit')
    .description('根據 git diff 產生 commit message')
    .action(handleCommit)
}

async function handleCommit() {
  const diff = await gitDiff()
  if (!diff) {
    console.log(chalk.red('暫存區沒有變更，請先 git add'))
    return
  }

  const provider = getProvider()

  const client = await chosenProvider(provider)

  const chunks = splitToChunks(diff)
  let finalMessage = ''

  if (chunks.length > 1) {
    console.log(chalk.cyan(`將 diff 分成 ${chunks.length} 段送出`))

    for (let i = 0; i < chunks.length; i++) {
      const result = await client.chat([
        {
          role: 'system',
          content: commitMessagePromptMultiple(chunks.length, i + 1),
        },
        { role: 'user', content: chunks[i] },
      ])

      if (i === chunks.length - 1)
        finalMessage = result
      console.log(chalk.cyan(`段 ${i + 1}/${chunks.length}: ${result}`))
      await delay(1000)
    }
  }
  else {
    finalMessage = await client.chat([
      { role: 'system', content: commitMessagePromptSingle },
      { role: 'user', content: diff },
    ])
    console.log(chalk.yellow(finalMessage))
  }

  const confirm = await confirmCommit()
  if (confirm) {
    await gitCommit(finalMessage)
    console.log(chalk.green('Commit 已建立 🎉'))
  }
  else {
    console.log(chalk.yellow('已取消'))
  }
}

const MAX_CHUNK_SIZE = 30000
function splitToChunks(text, size = MAX_CHUNK_SIZE) {
  const chunks = []
  for (let i = 0; i < text.length; i += size)
    chunks.push(text.slice(i, i + size))
  return chunks
}

async function chosenProvider(provider) {
  switch (provider) {
    case 'Groq': return createGroqClient()
    case 'Gemini': return createGeminiClient()
    case 'DeepSeek': return createDeepSeekClient()
    default:
      throw new Error(`不支援的 provider: ${provider}`)
  }
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
