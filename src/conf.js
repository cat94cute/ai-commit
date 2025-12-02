import Conf from 'conf'

const config = new Conf({
  projectName: 'ai-commit',
})

export function setApiKey(key) {
  if (!key)
    throw new Error('你需要輸入api key')
  config.set('API_SECRET_KEY', key)
}

export function getApiKey() {
  const key = config.get('API_SECRET_KEY')
  if (!key)
    throw new Error('你需要先設定key')
  return key
}
