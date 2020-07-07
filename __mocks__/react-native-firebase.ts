export default {
  database: jest.fn(),
  functions: () => ({ httpsCallable: jest.fn() }),
  analytics: jest.fn(),
  notifications: () => ({ setBadge: jest.fn() }),
}
