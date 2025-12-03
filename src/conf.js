import Conf from 'conf'
import { API_PROVIDERS } from './const/index.js'

const config = new Conf({
  projectName: 'ai-commit',
})

export function getProvider() {
  const provider = config.get('API_PROVIDER')
  if (!provider)
    return 'groq'
  return provider
}

export function setProvider(provider) {
  if (!provider)
    throw new Error('你需要輸入提供者名稱')

  const providerExists = API_PROVIDERS.some(item => item.value === provider)
  if (!providerExists)
    throw new Error(`未知的 provider: ${provider}`)

  config.set('API_PROVIDER', provider)
}

export function getApiKey() {
  const providerValue = getProvider()
  const provider = API_PROVIDERS.find(p => p.value === providerValue)
  if (!provider)
    throw new Error('未知的 provider')

  const key = config.get(provider.apiKeyName)
  if (!key)
    throw new Error('你需要先設定key')

  return key
}

export function setApiKey(key) {
  if (!key)
    throw new Error('你需要輸入api key')
  const providerValue = getProvider()
  const provider = API_PROVIDERS.find(p => p.value === providerValue)

  config.set(provider.apiKeyName, key)
}
