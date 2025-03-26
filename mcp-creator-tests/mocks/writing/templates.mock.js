// Mock for the templates module
module.exports = {
  getIndexFileContent: jest.fn().mockReturnValue('mock index content'),
  getServerFileContent: jest.fn().mockReturnValue('mock server content'),
  getBasicHandlerContent: jest.fn().mockReturnValue('mock handler content'),
  getUtilsContent: jest.fn().mockReturnValue('mock utils content'),
  getEchoExampleContent: jest.fn().mockReturnValue('mock echo example content'),
  getCalculatorExampleContent: jest.fn().mockReturnValue('mock calculator example content'),
  getBasicTestContent: jest.fn().mockReturnValue('mock test content'),
  getConfigUtilContent: jest.fn().mockReturnValue('mock config util content'),
  getAuthContent: jest.fn().mockReturnValue('mock auth content'),
  getLoggingContent: jest.fn().mockReturnValue('mock logging content'),
  getEdgeFunctionContent: jest.fn().mockReturnValue('mock edge function content'),
  getWebSocketContent: jest.fn().mockReturnValue('mock websocket content'),
  getReadmeContent: jest.fn().mockReturnValue('mock readme content')
};