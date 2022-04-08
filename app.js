const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
// 把参数转成json对象
const json = require('koa-json')
// 错误监听
const onerror = require('koa-onerror')
// 前端请求的转换
const bodyparser = require('koa-bodyparser')
// 日志
// const logger = require('koa-logger')
const log4js = require('./utils/log4js');

// 路由
const index = require('./routes/index')
const users = require('./routes/users')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
// app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  // const start = new Date()
  await next();
  log4js.error('error output')
  // const ms = new Date() - start
  // console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes, app.use的方式加载我们的routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
