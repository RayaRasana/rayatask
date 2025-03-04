module.exports = {
  // environment
  adminUser: {
    email: 'demo@demo.demo',
    password: 'demo',
  },
  baseUrl: process.env.BASE_URL ?? 'http://192.168.10.112:1337/',
  // playwright
  slowMo: parseInt(process.env.SLOW_MO, 10) || 1000,
  timeout: parseInt(process.env.TIMEOUT, 10) || 6000,
  headless: process.env.HEADLESS !== 'true',
};
