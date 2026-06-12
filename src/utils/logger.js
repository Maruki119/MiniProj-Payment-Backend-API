const pino = require("pino");

const transport = pino.destination({
  dest: "./logs/app.log",
  sync: false,
});

const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
  },
  transport
);

module.exports = logger;