// 进度条组件
let movableAreaWidth = 0 //进度条总宽度
let movableViewWidth = 0 //进度条宽度
const backgroundAudioManager = wx.getBackgroundAudioManager() //播放器 

let currentSec = -1 //当前秒数
let duration = 0 // 当前歌曲的总时长，以秒为单位
let isMoving = false //当前进度条是否在拖拽,解决:当进度条拖动时候和updatetime事件有冲突的问题

Component({
 // properties:组件的对外属性，是属性名到属性设置的映射表
  properties:{
    isSame: Boolean
  },

  data: {
    showTime:{
      currentTime:'00:00',
      totalTime: '00:00',
    },
    movableDis:0,// 总距离
    progress:0, // 进度条移动的距离
  },

// 生命周期函数调用 组件调用完执行
    lifetimes: {
      ready() {
        if(this.properties.isSame && this.data.showTime.totalTime == '00:00'){
          this._setTime()
        }
        this._getMovableDis() // 获取宽度
        this._bindBGMEvent() // 获取播放器状态
      },
    },

  methods: {
    // 拖动
    bindChange(event){
      if (event.detail.source == 'touch'){
        this.data.progress = event.detail.x /(movableAreaWidth - movableViewWidth) * 100 
        this.data.movableDis = event.detail.x
        isMoving = true
      }
    },
    onTouchend(){
      const currentTimeFmt = this._dateFormat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({
        progress: this.data.progress,  
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: currentTimeFmt.min + ':' + currentTimeFmt.sec
      })
      // 设置歌曲进度位置
      backgroundAudioManager.seek(duration * this.data.progress / 100)
      isMoving = false 
    },

// 获取手机宽度
    _getMovableDis() {
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec((rect)=>{
        // 返回数组
        console.log(rect)
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
        console.log(movableAreaWidth,movableViewWidth)
      })
    },

    // 播放器状态
    _bindBGMEvent() {

      // 播放事件
      backgroundAudioManager.onPlay(() => {
        console.log('onPlay')
        isMoving = false
        this.triggerEvent('musicPlay')
      })

      // 停止播放事件
      backgroundAudioManager.onStop(() => {
        console.log('onStop')
      })

      // 暂停事件
      backgroundAudioManager.onPause(() => {
        console.log('Pause')
        this.triggerEvent('musicPause')
      })

      // 音频加载中事件
      backgroundAudioManager.onWaiting(() => {
        console.log('onWaiting')
        // 设置歌曲总时间
        console.log(backgroundAudioManager.duration)
      })

      // 可以播放状态
      backgroundAudioManager.onCanplay(() => {
        console.log('onCanplay')
        // console.log(backgroundAudioManager.duration)
        if (typeof backgroundAudioManager.duration != 'undefined') {
          this._setTime()
      }else{
        setTimeout(()=>{
          this._setTime()
        }, 1000)
      }
      })

      // 监听进度
      backgroundAudioManager.onTimeUpdate(() => {
        // console.log('onTimeUpdate')
        if (!isMoving) {
          const currentTime = backgroundAudioManager.currentTime //已播放时间
          const duration = backgroundAudioManager.duration //歌曲总时长
          const sec = currentTime.toString().split('.')[0]
          if (sec != currentSec) {
            // console.log(currentTime)
            const currentTimeFmt = this._dateFormat(currentTime) // 格式化时间
            this.setData({
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100,
              ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
            })
            currentSec = sec
            // 联动歌词
            this.triggerEvent('timeUpdate', {
              currentTime
            })
          }
        }
      
      })

      // 播放结束
      backgroundAudioManager.onEnded(() => {
        console.log('onEnded')
        // 触发,激活事件
        this.triggerEvent('musicEnd')
      })

      backgroundAudioManager.onError((res) => {
        console.error(res.errMsg)
        console.error(res.errCode)
        wx.showToast({
          title: '错误:' + res.errCode,
        })
    })
  },

  //设置歌曲时长
  _setTime(){
    duration = backgroundAudioManager.duration //总时长
    console.log(duration)
    const durationFmt = this._dateFormat(duration)
    console.log(durationFmt)
    this.setData({
      ['showTime.totalTime']:`${durationFmt.min}:${durationFmt.sec}`
    })
  },

  // 格式化时间
  _dateFormat(sec) {
    const min = Math.floor(sec / 60)
    sec = Math.floor(sec % 60)
    return {
      'min': this._parse0(min),//分
      'sec': this._parse0(sec),//秒
    }
  },

//补零
  _parse0(sec){
      return sec < 10 ? '0' + sec : sec
  }
  }
})