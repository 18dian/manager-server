const log4js = require('log4js');

const levels = {
  'trace': log4js.levels.TRACE,
  'debug': log4js.levels.DEBUG,
  'info': log4js.levels.INFO,
  'warn': log4js.levels.WARN,
  'error': log4js.levels.ERROR,
  'fatal': log4js.levels.FATAL,
}

log4js.configure({
  appenders: {
    console: { type: "console" },
    info: {
      type: 'file',
      filename: 'logs/all-logs'
    },
    error: {
      type: 'file',
      filename: 'logs/error-logs.log',
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true, //pattern + filename的结合
    }
  },
  categories: {
    default: { appenders: ["console", "info", "error"], level: "debug" },
    error: { appenders: ["console", "info", "error"], level: "error" },
  }
})

// debug
exports.debug = (content) => {
  const logger = log4js.getLogger();
  logger.level = levels.debug;
  logger.debug(content);
}

// error
exports.error = (content) => {
  const logger = log4js.getLogger();
  logger.level = levels.error;
  logger.error(content);
}

// info
exports.info = (content) => {
  const logger = log4js.getLogger();
  logger.level = levels.info;
  logger.info(content);
}