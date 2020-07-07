global.console.error = jest.fn()

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'))

jest.mock('@sentry/react-native', () => ({}))
