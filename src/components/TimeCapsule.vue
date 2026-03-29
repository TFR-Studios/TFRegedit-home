<template>
  <div class="time-capsule">
    <div class="title">
      <hourglass-full theme="two-tone" size="24" :fill="['#efefef', '#00000020']" />
      <span>时光胶囊</span>
    </div>
    <div class="progress-container">
      <span class="text">今日已经度过了&nbsp;{{ timeData.day.elapsed }}&nbsp;小时</span>
      <div class="progress-with-remain">
        <el-progress :text-inside="true" :stroke-width="20" :percentage="timeData.day.pass" />
        <span class="remain-time">剩余{{ 24 - timeData.day.elapsed }}小时</span>
      </div>
    </div>
    <div class="progress-container">
      <span class="text">本周已经度过了&nbsp;{{ timeData.week.elapsed }}&nbsp;天</span>
      <div class="progress-with-remain">
        <el-progress :text-inside="true" :stroke-width="20" :percentage="timeData.week.pass" />
        <span class="remain-time">剩余{{ 7 - timeData.week.elapsed }}天</span>
      </div>
    </div>
    <div class="progress-container">
      <span class="text">本月已经度过了&nbsp;{{ timeData.month.elapsed }}&nbsp;天</span>
      <div class="progress-with-remain">
        <el-progress :text-inside="true" :stroke-width="20" :percentage="timeData.month.pass" />
        <span class="remain-time">剩余{{ timeData.month.total - timeData.month.elapsed }}天</span>
      </div>
    </div>
    <div class="progress-container">
      <span class="text">今年已经度过了&nbsp;{{ timeData.year.elapsed }}&nbsp;个月</span>
      <div class="progress-with-remain">
        <el-progress :text-inside="true" :stroke-width="20" :percentage="timeData.year.pass" />
        <span class="remain-time">剩余{{ 12 - timeData.year.elapsed }}个月</span>
      </div>
    </div>
    <div v-if="startDate?.length >= 4 && store.siteStartShow">
      <span class="text" v-html="startDateText" />
    </div>
  </div>
</template>

<script setup>
// 导入沙漏图标
import { HourglassFull } from "@icon-park/vue-next";
// 导入时间相关工具函数
import { getTimeCapsule, siteDateStatistics } from "@/utils/getTime.js";
// 导入主状态存储
import { mainStore } from "@/store";
const store = mainStore();

// 响应式引用
// 时间进度数据，包括日、周、月、年的进度
const timeData = ref(getTimeCapsule());
// 建站日期，从环境变量获取
const startDate = ref(import.meta.env.VITE_SITE_START);
// 建站时间统计文本
const startDateText = ref(null);
// 定时器引用
const timeInterval = ref(null);

onMounted(() => {
  // 组件挂载后，设置定时器每秒更新时间数据
  timeInterval.value = setInterval(() => {
    // 更新时间进度数据
    timeData.value = getTimeCapsule();
    // 如果设置了建站日期，则更新建站时间统计文本
    if (startDate.value) {
      startDateText.value = siteDateStatistics(new Date(startDate.value));
    }
  }, 1000);  // 每1000毫秒（1秒）更新一次
});

onBeforeUnmount(() => {
  // 组件卸载前清除定时器，防止内存泄漏
  clearInterval(timeInterval.value);
});
</script>

<style lang="scss" scoped>
.time-capsule {
  width: 100%;
  .title {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 0.2rem 0 1.5rem;
    font-size: 1.1rem;
    .i-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 6px;
    }
  }
  .text {
    display: block;
    margin: 1rem 0rem 0.5rem 0rem;
    font-size: 0.95rem;
  }
}
  .progress-container {
    margin: 1rem 0rem 0.5rem 0rem;
  }
  
  .progress-with-remain {
    display: flex;
    align-items: center;
    gap: 10px;
    
    :deep(.el-progress) {
      flex: 1;
      margin: 0;
      
      .el-progress-bar {
        margin-right: 0;
      }
      
      .el-progress__text {
        display: inline-block;
        margin-left: 10px;
        white-space: nowrap;
      }
    }
    
    .remain-time {
      flex-shrink: 0;
      font-size: 0.85rem;
      color: #efefef;
      opacity: 0.8;
      white-space: nowrap;
    }
  }
</style>