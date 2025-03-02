module.exports = {
  // environment
  adminUser: {
    email: 'demo@demo.demo',
    password: 'demo',
  },
  baseUrl: process.env.BASE_URL ?? 'http://85.9.109.23:1337/',
  // playwright
  slowMo: parseInt(process.env.SLOW_MO, 10) || 1000,
  timeout: parseInt(process.env.TIMEOUT, 10) || 6000,
  headless: process.env.HEADLESS !== 'true',
};
