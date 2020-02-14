// 播放歌曲页面
let musiclist = []
//正在播放的歌曲index
let nowPlayingIndex = 0
//获取全局唯一的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()
const app = getApp()

Page({
  data: {
    picUrl:'',
    isPlaying: false,// false表示不播放，ture表示正在播放
  },

  onLoad: function (options) {
    console.log(options)
    nowPlayingIndex = options.index
    musiclist = wx.getStorageSync('musiclist')
    this._loadMusicDetail(options.musicId)
  },

//加载点击的歌曲
_loadMusicDetail(musicId){
  backgroundAudioManager.stop()
  let music = musiclist[nowPlayingIndex]
  console.log(music)
  wx.setNavigationBarTitle({
    title: music.name,
  })

this.setData({
  picUrl:music.al.picUrl,
  isPlaying: false,
})

wx.showLoading({
  title: '歌曲加载中',
})
wx.cloud.callFunction({
  name:'music',
  data:{
    musicId,
    $url:'musicUrl',
  }
}).then((res)=>{
  console.log(res)
  console.log(JSON.parse(res.result))
  let result = JSON.parse(res.result)
  backgroundAudioManager.src = result.data[0].url
  backgroundAudioManager.title = music.name
  backgroundAudioManager.coverImgUrl = music.al.picUrl
  backgroundAudioManager.singer = music.ar[0].name
  backgroundAudioManager.epname = music.al.name 
  this.setData({
    isPlaying:true
})
wx.hideLoading()
    })
    
},

// 暂停按钮
  togglePlaying(){
    if(this.data.isPlaying){
      backgroundAudioManager.pause()
    }else{
      backgroundAudioManager.play()
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },

  //上一首
  onPrev(){
    nowPlayingIndex--
    if (nowPlayingIndex < 0){
      nowPlayingIndex = musiclist.length -1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },

  //下一首
  onNext(){
    nowPlayingIndex++
    if (nowPlayingIndex === musiclist.length){
      nowPlayingIndex = 0
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
})