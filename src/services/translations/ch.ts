export default {
  // WelcomeScreen
  'create-your-wallet-and': '创建您的钱包并进行无限制的免费交易',
  'create-wallet': '创建钱包',
  'restore-wallet': '导入钱包',
  'this-is-highly-experimental':
    '这是一个高度实验性的钱包应用程序 绝对不会在资产或转账上隐含任何形式的责任，保险，保证，隐私或保修。',
  'by-signing-up': '完成注册表示您同意',
  'terms-of-use': '使用条款和隐私政策',
  'generating-wallet': '正在生成您的钱包',

  // SelectAuthMethodScreen
  'choose-your-authentication-method': '选择您的身份验证方式',
  'to-protect-your-funds': '它将用来保障您的资产安全',
  pincode: '数字密码',
  fingerprint: '指纹',
  'face-id': '面容ID',

  // LockScreen
  'enter-pass-code': '输入密码',
  'create-pass-code': '设置密码',
  'verify-pass-code': '确认密码',
  'pin-doesnt-match': '密码不一致',
  'unlock-with': '使用',
  'with-fingerprint': '指纹解锁',
  'with-face-id': '面容ID解锁',
  'unlock-wallet': '解锁钱包',

  // RestoreWalletScreen
  'enter-key': '输入私钥/助记词',
  // TODO Update
  // 'enter-your-recovery-phrase': '输入您的12位助记词',
  'enter-private-key': '输入您的非 0x开头的明文私钥',
  'enter-keystore-content': '输入 keystore 文件内容',
  'enter-password': '输入密码',
  'private-key': '私钥',
  keystore: 'Keystore',

  // LanguageSettingsScreen
  language: '语言',

  // ContactsScreen
  'address-book': '地址簿',
  'search-contact': '搜索联系人',
  close: '关闭',
  'address-or-name': '地址或姓名',
  'contacts-on-Liquidity': '在流动网络上的来往记录',
  'no-contacts': '目前为止还没有联系人，添加一个吧!',

  // CreateContactScreen
  'create-new-contact': '新建联系人',
  name: '姓名',
  address: '地址',
  confirm: '确认',
  'create-contact-warning':
    '请注意，联系人不会存储在任何服务器上，如果卸载此应用程序，将会删除联系人。',

  // HomeScreen
  'total-assets': '总资产',
  receive: '接收',
  send: '发送',
  convert: '转换',

  // BackupPassphraseScreen
  'backup-passphrase': '备份助记词',
  'write-down-the': '将助记词抄写在一张纸上并保存在安全的地方',
  'if-you-lose-your': '如果您丢失了助记词，您将无法找回您的资产',
  'i-have-saved-it': '我已妥善保存',

  // BackupPassphraseVerifyScreen
  'verify-your-passphrase': '验证您的助记词',
  'word-incorrect': '单词不正确，请输入助记词中所对应的正确单词',
  'enter-word-of-passphrase': '输入第 %{number} 个助记词单词:',
  'complete-verification': '完成验证',

  // ContactDetailsScreen
  'contact-details': '联系人详细信息',

  // ConversionScreen
  conversion: '转换',
  balance: '余额',
  amount: '金额',
  'conversion-limit': '转换限制:',
  'max-fee': '最高矿工费',
  'edit-gas': '自定义矿工费',
  'conversion-amount-invalid': '转换金额无效',
  'not-enough-funds': '没有足够的资产',

  // EditFeeScreen
  'edit-fee': '自定义矿工费',
  gas: 'Gas',
  'gas-limit': 'Gas 限制',
  'gas-price': 'Gas 价格',
  cancel: '取消',
  save: '保存',

  // HubMonitoringScreen
  'hub-monitoring': '枢纽监控',
  'liquidity-network-hubs-are':
    '流动网络的枢纽们构成了一个无信任的链下支付系统。他们的安全性依赖于积极监控枢纽的行为。您的钱包会为您处理此事并确保您的资产安全。',
  'starting-a-dispute':
    '目前无法在移动设备上对枢纽发起诉讼，不过您可以使用网页钱包发起诉讼。将来会添加此功能。',
  'hub-status': '枢纽状态',
  currency: '货币',
  safe: '安全',
  unsafe: '不安全',
  'initiate-state-update-challenge': '发起状态更新诉讼',
  'initiate-state-update-challenge-description':
    '您即将针对所选币种发起状态更新诉讼。这项操作消耗约300,000 gas与少量矿工费。',
  'hub-address': '枢纽地址',

  // ReceiveMoneyPopup
  'receive-money': '收钱',
  'create-payment-request': '发起支付请求',
  share: '分享',
  'share-public-key': '分享您的收款地址',

  // CreatePaymentRequestScreen
  'scan-this-code': '让您的朋友使用他的流动网络钱包扫描此二维码',

  // SendScreen
  'send-money': '付钱',
  'to-address-or-name': '发送至 (地址或姓名)',
  'no-transaction-fee': '没有交易手续费',
  'transaction-sent': '发送交易',
  alert: '警告',
  'currency-inside-payment-not-exist': '您的钱包中不存在扫描付款请求中的货币',

  // SettingsScreen
  settings: '设置',
  network: '网络',
  passphrase: '助记词',
  website: '官方网站',

  // NetworkSettingsScreen
  'main-eth-network': '以太坊主网',
  'rinkeby-test-network': '以太坊Rinkeby测试网',

  // TokenSelectionScreen
  'select-wallet': '选择钱包',
  'chose-the-tokens': '选择您希望在钱包中使用的代币',

  // TransactionsScreen
  transactions: '交易',
  'no-transactions-so-far': '目前为止没有交易，\n 为什么你不做点什么',

  // TransactionScreen
  'transaction-details': '交易明细',
  'has-been-copied': '已被复制到剪贴板',
  'initiate-delivery-challenge': '发起交货诉讼',
  'start-delivery-challenge': '开始交货诉讼',
  'initiate-delivery-challenge-description':
    '您即将针对所交易在链上发起交货诉讼。这项操作消耗约300,000 gas与少量矿工费。',
  status: '状态',
  from: '发款方',
  to: '收款方',
  fee: '矿工费用',
  'no-fee': '免费',
  reference: '备注',
  time: '交易时间',
  rejected: '已拒绝',
  confirmed: '已确认',
  pending: '打包中',
  'blocks-to-confirmation': '未确认区块', // 还需等待 "N 区块来确认交易"
  'view-blockchain-explorer': '在区块浏览器中查看交易',

  // TermsAcceptanceScreen
  'terms-conditions': '条款和条件',
  accept: '接受',

  // QRScannerScreen
  'permission-camera': '允许使用相机',
  'permission-camera-message': '我们需要您的许可才能使用手机的相机',

  // OnBoardingScreen
  'on-boarding-one': '随着流动网络的普及，区块链如今可以扩展到数百万用户同时使用',
  'on-boarding-two': '首先将您的资产（如以太币或代币）转换为迅捷资产',
  'on-boarding-three': '发送您的迅捷资产',
  'on-boarding-four': '获得免费的加密货币',
  skip: '跳过',

  // BottomTabBar
  'scan-qr': '扫一扫',
  'menu-home': '资产',
  'menu-transactions': '交易记录',
  'menu-conversion': '转换',
  'menu-settings': '设置',

  // CopyButton
  copy: '复制',

  // PickerPopup
  submit: '提交',

  // onChain.ts
  error: '错误',
  'state-challenge': '陈述诉状',
  'delivery-challenge': '提交诉状',
  'recover-funds': '复原资产',

  // offChain.ts
  'initiate-recovery': '复原',
  'initiate-recovery-description':
    '此交易枢纽正处于复原状态中。为了让您的资产通过链上返还您的地址，请确认复原交易。这项操作消耗约300,000 gas。',

  // Time
  min: '分', // Short from "minutes"
  hrs: '时', // Short from "hours"
}
