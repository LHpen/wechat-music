// 歌曲组件
let lyricHeight = 0 //当前歌词高度
Component({
properties:{
  isLyricShow: {
    type: Boolean,
    value: false,
  },
  lyric : String,
},

// 监听器
observers: {
  lyric(lrc){
    if (lrc=='暂无歌词'){
      this.setData({
        lrcList: [{
          lrc,
          tiume:0,
        }
        ],
        nowLyricIndex: -1
      })
    }else{
      this._parseLyric(lrc)

    }
    // console.log(lrc)
  }
},
data:{
  lrcList:[],
  nowLyricIndex: 0, // 当前选中的歌词的索引
  scrollTop: 0, // 滚动条滚动的高度
},

// 生命周期函数
lifetimes:{
  ready(){
    // 750rpx 获取手机屏幕宽度
    wx.getSystemInfo({
      success(res) {
        console.log(res)
        // 求出1rpx的大小
        lyricHeight = res.screenWidth / 750 * 64
      }
    })
  },
},
  methods:{
    // currentTime:歌曲播放的时间
    // lrcList: 当前歌词
    update(currentTime){
      // console.log(currentTime)
      let lrcList = this.data.lrcList
      if (lrcList.length == 0) {
        return
      }
      if (currentTime > lrcList[lrcList.length - 1].time){
        if(this.data.nowLyricIndex != -1){
          this.setData({
            nowLyricIndex:-1,
            scrollTop: lrcList.length *lyricHeight
          })
        }
      }
      for (let i = 0 ,len = lrcList.length; i < len; i++){
        if (currentTime <= lrcList[i].time){
          this.setData({
            nowLyricIndex: i -1,
            scrollTop: (i - 1) * lyricHeight
          })
          break
        }
      }
    },
    _parseLyric(sLyric){
      let line = sLyric.split('\n')
      // console.log(line)
      // 存歌词
      let _lrcList = []
      // 解析数组歌词
      line.forEach((elem) =>{
        let time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        if (time !=null){
          let lrc = elem.split(time)[1] //歌词
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          // 把时间转成秒
          let time2Seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000 
          _lrcList.push({
            lrc,
            time: time2Seconds,
          })
        }
      })
      this.setData({
        lrcList:_lrcList
      })
    }

  }
  
})