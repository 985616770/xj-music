// 云函数入口文件
const cloud = require('wx-server-sdk')
const rp = require('request-promise')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

const URL = 'http://musicapi.xiecheng.live/personalized'

const MAX_LIMIT = 100

const playlistCollection = db.collection('playlist')

// 云函数入口函数
exports.main = async (event, context) => {
  // 只能获取100条(通过改limit 可以达到100条)
  // const list = await playlistCollection.get()

  // 判断数据库条数,并从中取数
  const countResult = await playlistCollection.count()
  const total = countResult.total
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    let promise = playlistCollection
      .skip(i * MAX_LIMIT)
      .limit(MAX_LIMIT)
      .get()
    tasks.push(promise)
  }

  let list = {
    data: []
  }
  if (tasks.length > 0) {
    list = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }

  // 从第三方更新数据
  const playlist = await rp(URL).then(res => {
    return JSON.parse(res).result
  })

  const newData = []
  // 去重
  for (let i = 0, len1 = playlist.length; i < len1; i++) {
    // 标志位
    let flag = true
    for (let j = 0, len2 = list.data.length; j < len2; j++) {
      if (playlist[i].id === list.data[j].id) {
        console.log('去重成功')
        flag = false
        break
      }
    }
    if (flag) {
      newData.push(playlist[i])
    }
  }

  // 向数据库添加 条目
  for (let i = 0, len = newData.length; i < len; i++) {
    await playlistCollection
      .add({
        data: {
          ...newData[i],
          createTime: db.serverDate()
        }
      })
      .then(res => {
        console.log('success')
      })
      .catch(err => {
        console.log('failed')
      })
  }

  return newData
}
