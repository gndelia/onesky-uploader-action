const tasks = arr => arr.join(' && ')

module.exports = {
  hooks: {
    'pre-commit': tasks([
      'lint-staged',
      'rm -rf lib',
      'npm run build',
      'git add lib'
    ]),
    'commit-msg': 'commitlint -E HUSKY_GIT_PARAMS'
  }
}