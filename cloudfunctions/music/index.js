// 云函数入口文件
// 云端传输的数据
const cloud = require('wx-server-sdk')

const TcbRouter = require('tcb-router')

const rp =require('request-promise')

const BASE_URL = 'http://musicapi.xiecheng.live'

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({event})
  
  app.router('playlist', async(ctx, next) =>{
    ctx.body = await cloud.database().collection('playlist')
      .skip(event.start)//跳过指定个数
      .limit(event.count)//查询结果数据
    .orderBy('createTime', 'desc') //排序
    .get()
    .then((res)=> {
      return res
    })
  })
//请求歌曲列表
  app.router('musiclist', async(ctx, next) => {
    ctx.body = await rp(BASE_URL +'/playlist/detail?id=' + parseInt(event.playlistId))
    .then((res) => {
      return JSON.parse(res)
    })
  })

//请求歌曲地址
  app.router('musicUrl', async (ctx, next) => {
    ctx.body = await rp(BASE_URL + `/song/url?id=${event.musicId}`).then((res) => {
      return res
    })
  })

 return app.serve()
}