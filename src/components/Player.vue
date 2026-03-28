<template>
  <APlayer
    v-if="playList[0]"
    ref="player"
    :audio="playList"
    :autoplay="store.playerAutoplay"
    :theme="theme"
    :autoSwitch="false"
    :loop="store.playerLoop"
    :order="store.playerOrder"
    :volume="volume"
    :showLrc="true"
    :listFolded="listFolded"
    :listMaxHeight="listMaxHeight"
    :noticeSwitch="false"
    @play="onPlay"
    @pause="onPause"
    @timeupdate="onTimeUp"
    @error="loadMusicError"
  />
</template>

<script setup>
// 导入图标
import { MusicOne, PlayWrong } from "@icon-park/vue-next";
// 导入获取播放列表的API函数
import { getPlayerList } from "@/api";
// 导入主状态存储
import { mainStore } from "@/store";
// 导入APlayer音乐播放器组件
import APlayer from "@worstone/vue-aplayer";

const store = mainStore();

// 获取播放器 DOM 引用
const player = ref(null);

// 歌曲播放列表响应式数据
const playList = ref([]);

// 当前播放歌曲索引
const playIndex = ref(0);

// 定义组件接收的props
const props = defineProps({
  // 主题颜色
  theme: {
    type: String,
    default: "#efefef",
  },
  // 默认音量，验证器确保值在0-1范围内
  volume: {
    type: Number,
    default: 0.7,
    validator: (value) => {
      return value >= 0 && value <= 1;
    },
  },
  // 歌曲服务器 ( netease-网易云, tencent-qq音乐 )
  songServer: {
    type: String,
    default: "netease", //'netease' | 'tencent'
  },
  // 播放类型 ( song-歌曲, playlist-播放列表, album-专辑, search-搜索, artist-艺术家 )
  songType: {
    type: String,
    default: "playlist",
  },
  // 歌曲或歌单ID
  songId: {
    type: String,
    default: "7452421335",
  },
  // 列表是否默认折叠
  listFolded: {
    type: Boolean,
    default: false,
  },
  // 列表最大高度
  listMaxHeight: {
    type: Number,
    default: 420,
  },
});

// 计算属性：列表高度，将数值转换为带单位的字符串
const listHeight = computed(() => {
  return props.listMaxHeight + "px";
});

// 组件挂载后初始化播放器
onMounted(() => {
  nextTick(() => {
    try {
      // 获取播放列表数据
      getPlayerList(props.songServer, props.songType, props.songId).then((res) => {
        console.log(res);
        // 更新播放器加载状态
        store.musicIsOk = true;
        // 将获取到的数据赋值给播放列表
        playList.value = res;
        console.log("音乐加载完成");
        console.log(playList.value);
        console.log(playIndex.value, playList.value.length, props.volume);
      });
    } catch (err) {
      // 处理错误情况
      console.error(err);
      store.musicIsOk = false;
      // 显示错误消息
      ElMessage({
        message: "播放器加载失败",
        grouping: true,
        icon: h(PlayWrong, {
          theme: "filled",
          fill: "#efefef",
        }),
      });
    }
  });
});

// 播放事件处理函数
const onPlay = () => {
  console.log("播放");
  // 更新当前播放歌曲的索引
  playIndex.value = player.value.aplayer.index;
  // 更新播放状态（注意：paused属性为true时表示暂停，所以直接赋值即可）
  store.setPlayerState(player.value.audioRef.paused);
  // 存储当前播放的歌曲信息（名称和艺术家）
  store.setPlayerData(playList.value[playIndex.value].name, playList.value[playIndex.value].artist);
  // 显示当前播放歌曲的消息
  ElMessage({
    message: store.getPlayerData.name + " - " + store.getPlayerData.artist,
    grouping: true,  // 启用消息分组
    icon: h(MusicOne, {  // 使用音乐图标
      theme: "filled",
      fill: "#efefef",
    }),
  });
};

// 暂停事件处理函数
const onPause = () => {
  // 更新播放状态
  store.setPlayerState(player.value.audioRef.paused);
};

// 音频时间更新事件处理函数（用于更新歌词）
const onTimeUp = () => {
  // 获取当前歌曲的歌词数组
  let lyrics = player.value.aplayer.lyrics[playIndex.value];
  // 获取当前播放位置对应的歌词索引
  let lyricIndex = player.value.aplayer.lyricIndex;
  // 如果没有歌词或当前索引无效，则返回
  if (!lyrics || !lyrics[lyricIndex]) {
    return;
  }
  // 获取当前歌词文本
  let lrc = lyrics[lyricIndex][1];
  // 处理特殊的歌词状态
  if (lrc === "Loading") {
    lrc = "歌词加载中";
  } else if (lrc === "Not available") {
    lrc = "歌词加载失败";
  }
  // 更新状态中的歌词
  store.setPlayerLrc(lrc);
};

// 切换播放暂停状态
const playToggle = () => {
  // 调用播放器的toggle方法切换播放状态
  player.value.toggle();
};

// 改变音量
// value: 新的音量值（0-1之间）
const changeVolume = (value) => {
  // 设置播放器音量，第二个参数false表示不保存到本地存储
  player.value.setVolume(value, false);
};

// 切换歌曲（上一首/下一首）
// type: 0表示上一首，1表示下一首
const changeSong = (type) => {
  // 根据type参数决定切换到上一首还是下一首
  type === 0 ? player.value.skipBack() : player.value.skipForward();
  // 在下一个DOM更新周期执行播放
  nextTick(() => {
    player.value.play();
  });
};

// 切换歌曲列表显示/隐藏状态
const toggleList = () => {
  // 调用播放器的切换列表方法
  player.value.toggleList();
};

// 音频加载错误处理函数
const loadMusicError = () => {
  let notice = "";
  // 根据播放列表长度决定提示信息
  if (playList.value.length > 1) {
    notice = "播放歌曲出现错误，播放器将在 2s 后进行下一首";
  } else {
    notice = "播放歌曲出现错误";
  }
  // 显示错误消息
  ElMessage({
    message: notice,
    grouping: true,
    icon: h(PlayWrong, {
      theme: "filled",
      fill: "#EFEFEF",
      duration: 2000,
    }),
  });
  // 在控制台记录错误信息
  console.error(
    "播放歌曲: " + player.value.aplayer.audio[player.value.aplayer.index].name + " 出现错误",
  );
};

// 暴露子组件方法给父组件使用
defineExpose({ playToggle, changeVolume, changeSong, toggleList });
</script>

<style lang="scss" scoped>
.aplayer {
  width: 80%;
  border-radius: 6px;
  font-family: "HarmonyOS_Regular", sans-serif !important;
  :deep(.aplayer-body) {
    background-color: transparent;
    .aplayer-pic {
      display: none;
    }
    .aplayer-info {
      margin-left: 0;
      background-color: #ffffff40;
      border-color: transparent !important;
      .aplayer-music {
        flex-grow: initial;
        margin-bottom: 2px;
        overflow: initial;
        .aplayer-title {
          font-size: 16px;
          margin-right: 6px;
        }
        .aplayer-author {
          color: #efefef;
        }
      }
      .aplayer-lrc {
        text-align: left;
        margin: 7px 0 6px 6px;
        height: 44px;
        mask: linear-gradient(
          #fff 15%,
          #fff 85%,
          hsla(0deg, 0%, 100%, 0.6) 90%,
          hsla(0deg, 0%, 100%, 0)
        );
        -webkit-mask: linear-gradient(
          #fff 15%,
          #fff 85%,
          hsla(0deg, 0%, 100%, 0.6) 90%,
          hsla(0deg, 0%, 100%, 0)
        );
        &::before,
        &::after {
          display: none;
        }
        p {
          color: #efefef;
        }
        .aplayer-lrc-current {
          font-size: 0.95rem;
          margin-bottom: 4px !important;
        }
      }
      .aplayer-controller {
        display: none;
      }
    }
  }
  :deep(.aplayer-list) {
    margin-top: 6px;
    height: v-bind(listHeight);
    background-color: transparent;
    ol {
      &::-webkit-scrollbar-track {
        background-color: transparent;
      }
      li {
        border-color: transparent;
        &.aplayer-list-light {
          background: #ffffff40;
          border-radius: 6px;
        }
        &:hover {
          background: #ffffff26 !important;
          border-radius: 6px !important;
        }
        .aplayer-list-index,
        .aplayer-list-author {
          color: #efefef;
        }
      }
    }
  }
}
</style>