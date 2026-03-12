require('dotenv').config()

const env = process.env.NODE_ENV || 'development'

const isTest = env === 'test'

const config = {
  env,
  isTest,
  port: process.env.PORT || 3000,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
}

module.exports = config

