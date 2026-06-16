// modules/logger.js — Simple logger

const config = require("./config").config;

const isDev = config.app.env === "development";

const logger = {
  info: (msg)  => console.log(`ℹ️  [INFO]  ${new Date().toISOString()} — ${msg}`),
  ok:   (msg)  => console.log(`✅ [OK]    ${new Date().toISOString()} — ${msg}`),
  warn: (msg)  => console.warn(`⚠️  [WARN]  ${new Date().toISOString()} — ${msg}`),
  error:(msg)  => console.error(`❌ [ERROR] ${new Date().toISOString()} — ${msg}`),
  debug:(msg)  => { if (isDev) console.log(`🔍 [DEBUG] ${new Date().toISOString()} — ${msg}`); },
};

module.exports = logger;