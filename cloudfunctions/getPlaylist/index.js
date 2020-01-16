// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

const rp = require('request-promise')

const URL = 'http://musicapi.xiecheng.live/personalized'

const playlistCollection = db.collection('playlist')

//请求数据条数
const MAX_LIMIT = 10

// 云函数入口函数
exports.main = async (event, context) => {
  const countResult = await playlistCollection.count()

  //获取数据库内容总条数
  const total = countResult.total 
  
  //需要请求数据的次数
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  const tasks = []
  //取数据
  /* 
  skip()：跳过指定个数 
  limit(): 查询结果数据
  reduce(): 累加器 acc表示当前数组对象 cur当前元素 
  concat(): 用于连接两个或多个数组。
  */
 for (let i = 0; i< batchTimes; i++) {
    let promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  let list = {
    data: []
  }
  if (tasks.length > 0) {
    list = (await Promise.all(tasks)).reduce((acc, cur) =>{
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }

  //请求接口信息
  const playlist = await rp(URL).then((res) => {
    return JSON.parse(res).result
  })

  //去重处理
  const newData = []
  for (let i = 0, len1 = playlist.length; i < len1; i++){
    let flag = true
    for(let j=0, len2 = list.data.length; j < len2; j++){
      if (playlist[i].id === list.data[j].id){
        flag = false
        break
      }
    }
    if (flag){
      newData.push(playlist[i])
    }
  }

//插入数据
  for (let i = 0, len = newData.length; i < len; i++) {
    await playlistCollection.add({
      data: {
        ...newData[i],
        createTime: db.serverDate(),
    }
  }).then((res) =>{
    console.log('插入成功')
  }).catch((err) =>{
    console.error('插入失败')
  })
}

return newData.length
}