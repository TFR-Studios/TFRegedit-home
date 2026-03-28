<template>
  <div v-if="siteLinks[0]" class="links">
    <div class="line">
      <Icon size="20">
        <Link />
      </Icon>
      <span class="title">网站列表</span>
    </div>
    <Swiper
      v-if="siteLinks[0]"
      :modules="[Pagination, Mousewheel]"  
      :slides-per-view="1"                
      :space-between="40"                 
      :pagination="{
        el: '.swiper-pagination',          
        clickable: true,                   
        bulletElement: 'div',              
      }"
      :mousewheel="true"                  
    >
      <SwiperSlide v-for="site in siteLinksList" :key="site">
        <el-row class="link-all" :gutter="20">
          <el-col v-for="(item, index) in site" :span="8" :key="item">
            <div
              class="item cards"                                    
              :style="index < 3 ? 'margin-bottom: 20px' : null"     
              @click="jumpLink(item)"                                
            >
              <Icon size="26">
                <component :is="siteIcon[item.icon]" />
              </Icon>
              <span class="name text-hidden">{{ item.name }}</span>
            </div>
          </el-col>
        </el-row>
      </SwiperSlide>
      <div class="swiper-pagination" />
    </Swiper>
  </div>
</template>

<script setup>
// 导入图标工具组件
import { Icon } from "@vicons/utils";
// 导入Font Awesome图标
//  https://www.xicons.org 
import { Link, Blog, CompactDisc, Cloud, Compass, Book, Fire, LaptopCode } from "@vicons/fa"; // 注意使用正确的类别
import { DeviceTv } from "@vicons/tabler"
// 导入主状态存储
import { mainStore } from "@/store";
// 导入Swiper组件
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Mousewheel } from "swiper";

// 导入网站链接数据
import siteLinks from "@/assets/siteLinks.json";

// 使用主状态存储
const store = mainStore();

// 计算属性：将网站链接数组按每组6个进行分组
const siteLinksList = computed(() => {
  const result = [];
  // 每次取6个链接组成一个数组项
  for (let i = 0; i < siteLinks.length; i += 6) {
    const subArr = siteLinks.slice(i, i + 6);  // 取从索引i开始的6个元素
    result.push(subArr);
  }
  return result;
});

// 网站链接图标映射对象
const siteIcon = {
  Blog,        // 博客图标
  Cloud,       // 云服务图标
  CompactDisc, // 音乐/媒体图标
  Compass,     // 指南/导航图标
  Book,        // 书籍/阅读图标
  Fire,        // 热门/推荐图标
  LaptopCode,  // 编程/开发图标
  DeviceTv,    // 影视/视频图标
};

// 链接跳转处理函数
const jumpLink = (data) => {
  // 如果点击的是“音乐”链接且启用了音乐点击设置
  if (data.name === "音乐" && store.musicClick) {
    // 如果存在$openList函数，则调用它打开音乐播放列表
    if (typeof $openList === "function") $openList();
  } else {
    // 否则在新窗口打开链接
    window.open(data.link, "_blank");
  }
};

onMounted(() => {
  // 组件挂载时打印网站链接数据到控制台
  console.log(siteLinks);
});
</script>

<style lang="scss" scoped>
.links {
  .line {
    margin: 2rem 0.25rem 1rem;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    animation: fade 0.5s;
    .title {
      margin-left: 8px;
      font-size: 1.15rem;
      text-shadow: 0 0 5px #00000050;
    }
  }
  .swiper {
    left: -10px;
    width: calc(100% + 20px);
    padding: 5px 10px 0;
    z-index: 0;
    .swiper-slide {
      height: 100%;
    }
    .swiper-pagination {
      position: static;
      margin-top: 4px;
      :deep(.swiper-pagination-bullet) {
        background-color: #fff;
        width: 18px;
        height: 4px;
        border-radius: 4px;
        transition: opacity 0.3s;
        &:hover {
          opacity: 1;
        }
      }
    }
  }
  .link-all {
    height: 220px;
    .item {
      height: 100px;
      width: 100%;
      display: flex;
      align-items: center;
      flex-direction: row;
      justify-content: center;
      padding: 0 10px;
      animation: fade 0.5s;

      &:hover {
        transform: scale(1.02);
        background: rgb(0 0 0 / 40%);
        transition: 0.3s;
      }

      &:active {
        transform: scale(1);
      }

      .name {
        font-size: 1.1rem;
        margin-left: 8px;
      }
      @media (min-width: 720px) and (max-width: 820px) {
        .name {
          display: none;
        }
      }
      @media (max-width: 720px) {
        height: 80px;
      }
      @media (max-width: 460px) {
        flex-direction: column;
        .name {
          font-size: 1rem;
          margin-left: 0;
          margin-top: 8px;
        }
      }
    }
    @media (max-width: 720px) {
      height: 180px;
    }
  }
}
</style>