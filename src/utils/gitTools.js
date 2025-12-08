import simpleGit from 'simple-git'

const git = simpleGit()

export async function gitDiff() {
  return await git.diff(['--cached'])
}

export async function gitCommit(message) {
  return await git.commit(message)
}
