/**
 * 数据库连接
 */
const mongoose = require("mongoose");
const config = require("./index");
const log4js = require("../utils/log4js");

main().catch((err) => log4js.error(err));

async function main() {
  await mongoose.connect(config.URL);
}

const db = mongoose.connection;

db.on("open", () => {
  log4js.info("数据库连接成功");
});
