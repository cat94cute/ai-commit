import { input, select } from '@inquirer/prompts'
import chalk from 'chalk'
import { getProvider, setApiKey, setProvider } from '../conf.js'
import { API_PROVIDERS } from '../const/index.js'

export function registerConfigCommand(program) {
  program
    .command('config')
    .description('設定Api key')
    .action(async () => {
      try {
        const provider = getProvider()
        console.log(chalk.yellow(`目前使用： ${provider}`))
        const answer = await select({
          message: '需要進行甚麼操作',
          choices: [
            { name: 'API Key 設定', value: 'setApiKey' },
            { name: 'AI Provider / Model 設定', value: 'setProvider' },
            { name: '取消', value: 'cancel' },
          ],
        })

        if (answer === 'setApiKey') {
          handleSetApiKey()
        }
        else if (answer === 'setProvider') {
          handleSetProvider()
        }
      }
      catch (error) {
        if (error instanceof Error && error.name === 'ExitPromptError') {
          console.log(chalk.yellow('\n取消操作'))
          return
        }
        console.error(error)
      }
    })
}

async function handleSetApiKey() {
  const apiKey = await input({
    message: '請輸入您的 API Key：',
    validate(value) {
      if (!value.trim())
        return 'API Key 不可為空'
      return true
    },
  })
  await setApiKey(apiKey)
  console.log(chalk.green('API Key 已儲存 ✔'))
}

async function handleSetProvider() {
  const selects = API_PROVIDERS.map((provider) => {
    if (provider.value === getProvider()) {
      return {
        name: `${provider.name} (目前使用中)`,
        value: provider.value,
      }
    }
    else {
      return {
        name: provider.name,
        value: provider.value,
      }
    }
  })
  const chosenProvider = await select({
    message: '請選擇 AI Provider：',
    choices: selects,
  })
  await setProvider(chosenProvider)
  console.log(chalk.green('AI Provider 已儲存 ✔'))
}
