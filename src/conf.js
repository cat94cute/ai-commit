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
  const provider = getProvider()
  let key = ''
  switch (provider) {
    case 'groq':
      key = config.get('GROQ_SECRET_KEY')
      break
    case 'openai':
      key = config.get('OPENAI_SECRET_KEY')
      break
    default:
      break
  }
  if (!key)
    throw new Error('你需要先設定key')
  return key
}

export function setApiKey(key) {
  if (!key)
    throw new Error('你需要輸入api key')
  const provider = getProvider()
  switch (provider) {
    case 'groq':
      config.set('GROQ_SECRET_KEY', key)
      break
    case 'openai':
      config.set('OPENAI_SECRET_KEY', key)
      break
    default:
      break
  }
}
