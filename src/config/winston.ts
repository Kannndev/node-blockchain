import * as appRoot from 'app-root-path';
import * as winston from 'winston';

const options = {
  file: {
    level: 'silly',
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: true
  },
  console: {
    level: 'silly',
    handleExceptions: true,
    json: false,
    colorize: true
  }
};

export const logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console)
  ],
  exitOnError: false // do not exit on handled exceptions
});
