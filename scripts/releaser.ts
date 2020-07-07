import inquirer from 'inquirer'
import figlet from 'figlet'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
const { spawnSync } = require('child_process')

import { throwError, spliceString } from './utils'

main()

async function main() {
  const baseDir = path.join(__dirname, '../')

  console.log(chalk.green(figlet.textSync('Liquidity Releaser')))

  const changeLog = fs.readFileSync(path.join(baseDir, 'CHANGELOG.md'), 'utf8')
  const unreleasedPosition = changeLog.indexOf('## [Unreleased]')

  if (unreleasedPosition === -1) {
    throwError('CHANGELOG.md does not contain [Unreleased] section')
  }

  if (changeLog.substr(unreleasedPosition + 15, 2) === '\n\n') {
    throwError('Unreleased section is empty, nothing to release')
  }

  const packageJson = fs.readFileSync(path.join(baseDir, 'package.json'), 'utf8')

  const versionSearchResult = packageJson.match(/"version": "(\d|\.)+"/)

  if (versionSearchResult == null) {
    throwError('Version number is not found in package.json')
  }

  const versionNumber = versionSearchResult[0].match(/(\d|\.)+/)[0]
  const versionNumberArray: Array<number | string> = versionNumber.split('.')

  console.log('Current version: ' + versionNumber)

  const question = [
    {
      type: 'list',
      name: 'type',
      message: 'Which bump is it - major, minor or patch?',
      choices: ['major', 'minor', 'patch'],
      default: 2,
    },
  ]

  const result = await inquirer.prompt(question)

  if (result.type === 'patch') {
    versionNumberArray[2] = Number(versionNumberArray[2]) + 1
  } else if (result.type === 'minor') {
    versionNumberArray[1] = Number(versionNumberArray[1]) + 1
    versionNumberArray[2] = 0
  } else {
    versionNumberArray[0] = Number(versionNumberArray[0]) + 1
    versionNumberArray[1] = 0
    versionNumberArray[2] = 0
  }

  const newVersionNumber = versionNumberArray.join('.')

  const newVersionString = versionSearchResult[0].replace(versionNumber, newVersionNumber)

  // const releaseChangeLog = changeLog.match(/Unreleased]\n([\s\S]*?)##/)

  const nowDate = new Date().toISOString().split('T')[0]
  const updatedChangeLog = spliceString(
    changeLog,
    unreleasedPosition + 16,
    0,
    `\n## [${newVersionNumber}] - ${nowDate}\n`,
  )
  fs.writeFileSync(path.join(baseDir, 'CHANGELOG.md'), updatedChangeLog, 'utf-8')

  const updatedPackageJson = packageJson.replace(versionSearchResult[0], newVersionString)

  console.log('New version: ', newVersionNumber)

  fs.writeFileSync(path.join(baseDir, 'package.json'), updatedPackageJson, 'utf8')
  console.log('- updated package.json')

  const infoPlist = fs.readFileSync(path.join(baseDir, './ios/wallet/Info.plist'), 'utf8')

  if (infoPlist.indexOf(versionNumber) === -1) {
    throwError('Version number inside Info.plist does not match version of package.json')
  }

  const updatedInfoPlist = infoPlist.replace(versionNumber, newVersionNumber)
  fs.writeFileSync(
    path.join(baseDir, './ios/wallet/Info.plist'),
    updatedInfoPlist,
    'utf8',
  )
  console.log('- updated Info.plist')

  const buildGradle = fs.readFileSync(
    path.join(baseDir, './android/app/build.gradle'),
    'utf8',
  )
  if (buildGradle.indexOf(versionNumber) === -1) {
    throwError('Version number inside build.gradle does not match version of package.json')
  }

  const updatedBuildGradle = buildGradle.replace(versionNumber, newVersionNumber)
  fs.writeFileSync(
    path.join(baseDir, './android/app/build.gradle'),
    updatedBuildGradle,
    'utf8',
  )
  console.log('- updated build.gradle')

  spawnSync('git', ['reset', 'HEAD'])
  spawnSync('git', ['add', '.'])
  spawnSync('git', ['commit', '-n', '-m', `[${newVersionNumber}] Release`])
  const gitPush = spawnSync('git', ['push', 'origin', 'HEAD'])

  if (gitPush.error) {
    throwError('Error pushing release commit to origin')
  }

  console.log('Pushed commit with release changes')
}
