// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  
  console.log(OPENID)

  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: OPENID,
      page: `/pages/blog-comment/blog-comment?blogId=${event.blogId}`,
      data: {
        name3: {
          value: event.nickName
        },
        thing1: {
          value: event.content
        }
      },
      templateId: 'wTwcu4XORo_PrHxubLki2YAGDI4ZQAMIjTRTs9hD9Is',
      miniprogramState: 'developer'
    })
    return result
  } catch (err) {
    return err
  }
}
