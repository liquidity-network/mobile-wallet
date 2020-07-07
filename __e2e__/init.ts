import { initTranslations } from '../src/services/translations/__mocks__'
// import { createTestAccounts } from './createAccounts'
// import { testAccounts } from './constants'

const detox = require('detox')
const config = require('../package.json').detox
const adapter = require('detox/runners/mocha/adapter')

before(async () => {
  initTranslations()

  await detox.init(config)
  await device.launchApp({
    permissions: { notifications: 'YES', camera: 'YES' },
    newInstance: true,
  })

  // console.log('=== CREATING TEST ACCOUNTS ===')
  // const accounts = await createTestAccounts()
  // testAccounts.ACCOUNT1_PUBLIC = accounts.account1.publicKey
  // testAccounts.ACCOUNT1_PRIVATE = accounts.account1.privateKey
  // testAccounts.ACCOUNT2_PUBLIC = accounts.account2.publicKey
  // testAccounts.ACCOUNT2_PRIVATE = accounts.account2.privateKey
  // console.log('ACCOUNT 1 PUBLIC:', testAccounts.ACCOUNT1_PUBLIC)
  // console.log('ACCOUNT 1 PRIVATE:', testAccounts.ACCOUNT1_PRIVATE)
  // console.log('ACCOUNT 2 PUBLIC:', testAccounts.ACCOUNT2_PUBLIC)
  // console.log('ACCOUNT 2 PRIVATE:', testAccounts.ACCOUNT2_PRIVATE)
  // .catch(e => console.error('Error creating test accounts:', e))
})

beforeEach(async function() {
  // @ts-ignore
  await adapter.beforeEach(this)
})

afterEach(async function() {
  // @ts-ignore
  await adapter.afterEach(this)
})

after(async () => {
  await detox.cleanup()
})
