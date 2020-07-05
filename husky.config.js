const tasks = arr => arr.join(' && ')

module.exports = {
  hooks: {
    'pre-commit': tasks([
      'lint-staged',
      'rm -rf lib',
      'ncc build src/index.ts -m -o lib --no-source-map-register',
      'git add lib'
    ])
  }
}