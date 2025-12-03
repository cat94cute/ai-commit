import Conf from 'conf'

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
  config.set('API_PROVIDER', provider)
}

export function getApiKey() {
  const key = config.get('API_SECRET_KEY')
  if (!key)
    throw new Error('你需要先設定key')
  return key
}

export function setApiKey(key) {
  if (!key)
    throw new Error('你需要輸入api key')
  config.set('API_SECRET_KEY', key)
}
