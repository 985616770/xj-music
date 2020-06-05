// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const wxContent = cloud.getWXContext()
    const result = await cloud.openapi.wxacode.getUnlimited({
      scene: wxContent.OPENID
    })

    const upload = await cloud.uploadFile({
      cloudPath: `qrcode/${Date.now()}-${Math.random()}.png`,
      fileContent: result.buffer
    })
    return upload
  } catch (err) {
    return err
  }
}
