<template>
  <!-- 盒子组件容器，鼠标悬停时显示关闭和设置按钮 -->
  <div class="box cards" @mouseenter="closeShow = true" @mouseleave="closeShow = false">
    <transition name="el-fade-in-linear">
      <close-one
        class="close"
        theme="filled"
        size="28"
        fill="#ffffff60"
        v-show="closeShow"
        @click="store.boxOpenState = false"
      />
    </transition>
    <transition name="el-fade-in-linear">
      <setting-two
        class="setting"
        theme="filled"
        size="28"
        fill="#ffffff60"
        v-show="closeShow"
        @click="store.setOpenState = true"
      />
    </transition>
    <div class="content">
      <TimeCapsule />
      <MoreContent />
    </div>
  </div>
</template>

<script setup>
// 导入关闭和设置图标
import { CloseOne, SettingTwo } from "@icon-park/vue-next";
// 导入主状态存储
import { mainStore } from "@/store";
// 导入组件
import TimeCapsule from "@/components/TimeCapsule.vue";  // 时光胶囊组件
import MoreContent from "@/components/MoreContent.vue";  // 更多内容组件

// 使用主状态存储
const store = mainStore();
// 响应式引用：控制关闭和设置按钮的显示状态
const closeShow = ref(false);  // 当鼠标悬停在盒子上时显示按钮
</script>

<style lang="scss" scoped>
.box {
  flex: 1 0 0%;
  margin-left: 0.75rem;
  height: 80%;
  max-width: 50%;
  position: relative;
  animation: fade 0.5s;

  &:hover {
    transform: scale(1);
  }

  .close,
  .setting {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 28px;
    height: 28px;
    transition:
      transform 0.3s,
      opacity 0.3s;

    &:hover {
      transform: scale(1.2);
    }

    &:active {
      transform: scale(1);
    }
  }

  .setting {
    right: 56px;
  }

  .content {
    display: flex;
    flex-direction: column;
    padding: 30px;
    width: 100%;
    height: 100%;
  }
}
</style>