// Mock for the templates module
module.exports = {
  getIndexFileContent: jest.fn(() => 'mock index content'),
  getServerFileContent: jest.fn(() => 'mock server content'),
  getBasicHandlerContent: jest.fn(() => 'mock handler content'),
  getUtilsContent: jest.fn(() => 'mock utils content'),
  getEchoExampleContent: jest.fn(() => 'mock echo example content'),
  getCalculatorExampleContent: jest.fn(() => 'mock calculator example content'),
  getBasicTestContent: jest.fn(() => 'mock test content'),
  getConfigUtilContent: jest.fn(() => 'mock config util content'),
  getAuthContent: jest.fn(() => 'mock auth content'),
  getLoggingContent: jest.fn(() => 'mock logging content'),
  getEdgeFunctionContent: jest.fn(() => 'mock edge function content'),
  getWebSocketContent: jest.fn(() => 'mock websocket content'),
  getReadmeContent: jest.fn(() => 'mock readme content')
};