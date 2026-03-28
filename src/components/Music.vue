<template>
  <!-- 音乐控制面板，仅在音乐面板开启状态时显示 -->
  <div
    class="music"
    @mouseenter="volumeShow = true"        
    @mouseleave="volumeShow = false"      
    v-show="store.musicOpenState"         
  >
    <!-- 面板按钮区域 -->
    <div class="btns">
      <span @click="openMusicList()">音乐列表</span>           <!-- 打开音乐列表 -->
      <span @click="store.musicOpenState = false">回到一言</span>  <!-- 关闭音乐面板，返回一言 -->
    </div>
    <!-- 播放控制区域 -->
    <div class="control">
      <!-- 上一首按钮 -->
      <go-start theme="filled" size="30" fill="#efefef" @click="changeMusicIndex(0)" />
      <!-- 播放/暂停按钮，根据播放状态显示不同图标 -->
      <div class="state" @click="changePlayState">
        <play-one theme="filled" size="50" fill="#efefef" v-show="!store.playerState" />  <!-- 暂停状态显示播放图标 -->
        <pause theme="filled" size="50" fill="#efefef" v-show="store.playerState" />      <!-- 播放状态显示暂停图标 -->
      </div>
      <!-- 下一首按钮 -->
      <go-end theme="filled" size="30" fill="#efefef" @click="changeMusicIndex(1)" />
    </div>
    <!-- 音乐信息和音量控制区域 -->
    <div class="menu">
      <!-- 音乐名称显示，仅在未显示音量时显示 -->
      <div class="name" v-show="!volumeShow">
        <span>{
          store.getPlayerData.name
            ? store.getPlayerData.name + " - " + store.getPlayerData.artist  <!-- 显示歌曲名和艺术家 -->
            : "未播放音乐"                                                     <!-- 无播放内容时显示提示 -->
        }</span>
      </div>
      <!-- 音量控制区域，仅在显示音量时显示 -->
      <div class="volume" v-show="volumeShow">
        <!-- 音量图标，根据音量大小显示不同图标 -->
        <div class="icon">
          <volume-mute theme="filled" size="24" fill="#efefef" v-if="volumeNum == 0" />      <!-- 静音图标 -->
          <volume-small
            theme="filled"
            size="24"
            fill="#efefef"
            v-else-if="volumeNum > 0 && volumeNum < 0.7" />                                   <!-- 小音量图标 -->
          <volume-notice theme="filled" size="24" fill="#efefef" v-else />                 <!-- 大音量图标 -->
        </div>
        <!-- 音量滑块，绑定音量数值 -->
        <el-slider v-model="volumeNum" :show-tooltip="false" :min="0" :max="1" :step="0.01" />
      </div>
    </div>
  </div>
  <!-- 音乐列表弹窗，使用淡入淡出和缩放动画 -->
  <Transition name="fade" mode="out-in">
    <!-- 弹窗遮罩层，点击关闭弹窗 -->
    <div class="music-list" v-show="musicListShow" @click="closeMusicList()">
      <!-- 列表内容缩放动画 -->
      <Transition name="zoom">
        <!-- 音乐播放器列表，阻止点击事件冒泡 -->
        <div class="list" v-show="musicListShow" @click.stop>
          <!-- 关闭按钮 -->
          <close-one
            class="close"
            theme="filled"
            size="28"
            fill="#ffffff60"
            @click="closeMusicList()" />
          <!-- 音乐播放器组件，传递服务器、类型、ID和音量参数 -->
          <Player
            ref="playerRef"                
            :songServer="playerData.server" 
            :songType="playerData.type"      
            :songId="playerData.id"          
            :volume="volumeNum"              
          />
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
// 导入音乐控制相关的图标
import {
  GoStart,        // 上一首图标
  PlayOne,        // 播放图标
  Pause,          // 暂停图标
  GoEnd,          // 下一首图标
  CloseOne,       // 关闭图标
  VolumeMute,     // 静音图标
  VolumeSmall,    // 小音量图标
  VolumeNotice,   // 大音量图标
} from "@icon-park/vue-next";
// 导入音乐播放器组件
import Player from "@/components/Player.vue";
// 导入主状态存储
import { mainStore } from "@/store";
const store = mainStore();

// 音量控制相关数据
const volumeShow = ref(false);  // 控制音量滑块显示/隐藏
const volumeNum = ref(store.musicVolume ? store.musicVolume : 0.7);  // 音量数值，默认0.7

// 播放列表相关数据
const musicListShow = ref(false);  // 控制音乐列表弹窗显示/隐藏
const playerRef = ref(null);       // 播放器组件引用
// 播放器配置数据，从环境变量获取
const playerData = reactive({
  server: import.meta.env.VITE_SONG_SERVER,  // 音乐服务器
  type: import.meta.env.VITE_SONG_TYPE,      // 音乐类型
  id: import.meta.env.VITE_SONG_ID,          // 音乐ID
});

// 开启播放列表
const openMusicList = () => {
  musicListShow.value = true;           // 显示音乐列表弹窗
  playerRef.value.toggleList();         // 调用播放器组件的切换列表方法
};

// 关闭播放列表
const closeMusicList = () => {
  musicListShow.value = false;          // 隐藏音乐列表弹窗
  playerRef.value.toggleList();         // 调用播放器组件的切换列表方法
};

// 音乐播放/暂停控制
const changePlayState = () => {
  playerRef.value.playToggle();         // 调用播放器组件的播放/暂停方法
};

// 切换音乐（上一首/下一首）
// type: 0表示上一首，1表示下一首
const changeMusicIndex = (type) => {
  playerRef.value.changeSong(type);     // 调用播放器组件的切换歌曲方法
};

onMounted(() => {
  // 监听键盘事件，支持空格键控制播放/暂停
  window.addEventListener("keydown", (e) => {
    // 如果音乐尚未加载完成，则不响应键盘事件
    if (!store.musicIsOk) {
      return ;
    }
    // 按下空格键时切换播放/暂停状态
    if (e.code == "Space") {
      changePlayState();
    }
  });
  
  // 将打开音乐列表的方法挂载到window对象，供外部调用
  window.$openList = openMusicList;
});

// 监听音量数值变化
watch(
  () => volumeNum.value,    // 监听音量数值
  (value) => {
    store.musicVolume = value;  // 更新状态中的音量值
    // 调用播放器组件的改变音量方法
    playerRef.value.changeVolume(store.musicVolume);
  },
);
</script>

<style lang="scss" scoped>
.music {
  width: 100%;
  height: 100%;
  background: #00000040;
  backdrop-filter: blur(10px);
  border-radius: 6px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  animation: fade 0.5s;
  .btns {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
    span {
      background: #ffffff26;
      padding: 2px 8px;
      border-radius: 6px;
      margin: 0px 6px;
      text-overflow: ellipsis;
      overflow-x: hidden;
      white-space: nowrap;
      &:hover {
        background: #ffffff4d;
      }
    }
  }
  .control {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    width: 100%;
    .state {
      .i-icon {
        width: 50px;
        height: 50px;
        display: block;
      }
    }
    .i-icon {
      width: 36px;
      height: 36px;
      display: flex;
      border-radius: 6px;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transform: scale(1);
      &:hover {
        background: #ffffff33;
      }
      &:active {
        transform: scale(0.95);
      }
    }
  }
  .menu {
    height: 26px;
    width: 100%;
    line-height: 26px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .name {
      width: 100%;
      text-align: center;
      text-overflow: ellipsis;
      overflow-x: hidden;
      white-space: nowrap;
      animation: fade 0.3s;
    }
    .volume {
      width: 100%;
      padding: 0 12px;
      display: flex;
      align-items: center;
      flex-direction: row;
      animation: fade 0.3s;
      .icon {
        margin-right: 12px;
        span {
          width: 24px;
          height: 24px;
          display: block;
        }
      }
      :deep(*) {
        transition: none;
      }
      :deep(.el-slider__button) {
        transition: 0.3s;
      }
      .el-slider {
        margin-right: 12px;
        --el-slider-main-bg-color: #efefef;
        --el-slider-runway-bg-color: #ffffff40;
        --el-slider-button-size: 16px;
      }
    }
  }
}
.music-list {
  position: fixed;
  top: 0;
  left: 0;
  margin: auto;
  width: 100%;
  height: 100%;
  background-color: #00000080;
  backdrop-filter: blur(20px);
  z-index: 1;
  .list {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: calc(50% - 300px);
    left: calc(50% - 320px);
    width: 640px;
    height: 600px;
    background-color: #ffffff66;
    border-radius: 6px;
    z-index: 999;
    @media (max-width: 720px) {
      left: calc(50% - 45%);
      width: 90%;
    }
    .close {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 28px;
      height: 28px;
      display: block;
      &:hover {
        transform: scale(1.2);
      }
      &:active {
        transform: scale(0.95);
      }
    }
  }
}

// 弹窗动画
.zoom-enter-active {
  animation: zoom 0.4s ease-in-out;
}
.zoom-leave-active {
  animation: zoom 0.3s ease-in-out reverse;
}
@keyframes zoom {
  0% {
    opacity: 0;
    transform: scale(0) translateY(-600px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>