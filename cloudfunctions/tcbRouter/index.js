// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({ event })

  app.use(async (ctx, next) => {
    ctx.data = {}
    ctx.data.openId = event.userInfo.openId
    await next()
  })

  app.router(
    'music',
    async (ctx, next) => {
      ctx.data.musicName = '杀杀杀'
      await next()
    },
    async (ctx, next) => {
      ctx.data.musicType = 'ss'
      ctx.body = {
        data: ctx.data
      }
    }
  )
  return app.serve()
}
