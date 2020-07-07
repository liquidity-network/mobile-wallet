import chalk from 'chalk'

export function throwError(message) {
  console.log(chalk.red('ERROR: ' + message))
  process.exit(1)
}

export function spliceString(str, index, count, add) {
  const ar = str.split('')
  ar.splice(index, count, add)
  return ar.join('')
}
