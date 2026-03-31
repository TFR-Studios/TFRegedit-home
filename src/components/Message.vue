// 监听窗口大小变化
window.addEventListener('resize', handleResize);

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});<template>
  <!-- 基本信息 -->
  <div class="message">
    <!-- Logo -->
    <div class="logo">
      <img class="logo-img" :src="siteLogo" alt="logo" />
      <div :class="{ name: true, long: siteUrl[0].length >= 6 }">
        <span class="bg" ref="bgElement">{{ siteUrl[0] }}</span>
        <span class="sm">.{{ siteUrl[1] }}</span>
      </div>
    </div>
    <!-- 简介 -->
    <div class="description cards" @click="changeBox">
      <div class="content">
        <Icon size="16">
          <QuoteLeft />
        </Icon>
        <div class="text">
          <p>{{ descriptionText.hello }}</p>
          <p>{{ descriptionText.text }}</p>
        </div>
        <Icon size="16">
          <QuoteRight />
        </Icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@vicons/utils";
import { QuoteLeft, QuoteRight } from "@vicons/fa";
import { Error } from "@icon-park/vue-next";
import { mainStore } from "@/store";
const store = mainStore();

// 主页站点logo
const siteLogo = import.meta.env.VITE_SITE_MAIN_LOGO;
// 站点链接
const siteUrl = computed(() => {
  const url = import.meta.env.VITE_SITE_URL;
  if (!url) return "imsyy.top".split(".");
  // 判断协议前缀
  if (url.startsWith("http://") || url.startsWith("https://")) {
    const urlFormat = url.replace(/^(https?:\/\/)/, "");
    return urlFormat.split(".");
  }
  return url.split(".");
});

// 简介区域文字
const descriptionText = reactive({
  hello: import.meta.env.VITE_DESC_HELLO,
  text: import.meta.env.VITE_DESC_TEXT,
});

// 切换右侧功能区
const changeBox = () => {
  if (store.getInnerWidth >= 990) {
    store.boxOpenState = !store.boxOpenState;
  } else {
    ElMessage({
      message: "当前页面宽度不足以开启盒子",
      grouping: true,
      icon: h(Error, {
        theme: "filled",
        fill: "#efefef",
      }),
    });
  }
};

// 获取元素引用
const bgElement = ref(null);

// 动态调整字体大小
const adjustFontSize = (element, maxFontSize = 5) => {
  if (!element) return;
  
  let fontSize = maxFontSize;
  element.style.fontSize = fontSize + 'rem';
  
  // 检查是否溢出，如果是则减小字体
  while ((element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight) && fontSize > 1) {
    fontSize -= 0.1;
    element.style.fontSize = fontSize + 'rem';
  }
};

// 监听状态变化
watch(
  () => store.boxOpenState,
  (value) => {
    if (value) {
      descriptionText.hello = import.meta.env.VITE_DESC_HELLO_OTHER;
      descriptionText.text = import.meta.env.VITE_DESC_TEXT_OTHER;
    } else {
      descriptionText.hello = import.meta.env.VITE_DESC_HELLO;
      descriptionText.text = import.meta.env.VITE_DESC_TEXT;
    }
  },
);

// 在组件挂载后调整字体大小
onMounted(() => {
  nextTick(() => {
    if (bgElement.value) {
      adjustFontSize(bgElement.value, 5);
    }
  });
});

// 监听窗口大小变化
const handleResize = () => {
  nextTick(() => {
    if (bgElement.value) {
      adjustFontSize(bgElement.value, 5);
    }
  });
};

// 监听窗口大小变化
window.addEventListener('resize', handleResize);
</script>

<style lang="scss" scoped>
.message {
  .logo {
    display: flex;
    flex-direction: row;
    align-items: center;
    animation: fade 0.5s;
    max-width: 460px;
    .logo-img {
      border-radius: 50%;
      width: 120px;
    }
    .name {
        width: 100%;
        padding-left: 22px;
        transform: translateY(-8px);
        font-family: "Pacifico-Regular";
        display: flex;
        align-items: baseline;
        overflow: hidden;

        .bg {
          font-size: 5rem;
          white-space: nowrap;
          overflow: hidden;
          flex: 1;
          min-width: 0;
          text-overflow: ellipsis;
          flex-shrink: 1;
          text-wrap: balance;
        }

        .sm {
          margin-left: 6px;
          font-size: 2rem;
          white-space: nowrap;
          flex-shrink: 0;
          @media (min-width: 720px) and (max-width: 789px) {
            display: none;
          }
        }
      }
    @media (max-width: 768px) {
      .logo-img {
        width: 100px;
      }
      .name {
        height: 128px;
        .bg {
          font-size: 4.5rem;
        }
      }
    }

    @media (max-width: 720px) {
      max-width: 100%;
    }
  }

  .description {
    padding: 1rem;
    margin-top: 3.5rem;
    max-width: 460px;
    animation: fade 0.5s;

    .content {
      display: flex;
      justify-content: space-between;

      .text {
        margin: 0.75rem 1rem;
        line-height: 2rem;
        margin-right: auto;

        p {
          &:nth-of-type(1) {
            font-family: "Pacifico-Regular";
          }
        }
      }

      .xicon:nth-of-type(2) {
        align-self: flex-end;
      }
    }
    @media (max-width: 720px) {
      max-width: 100%;
      pointer-events: none;
    }
  }
  @media (max-width: 390px) {
    .logo {
      flex-direction: column;
      .logo-img {
        display: none;
      }
      .name {
        margin-left: 0;
        height: auto;
        transform: none;
        text-align: center;
        .bg {
          font-size: 3.5rem;
        }
        .sm {
          font-size: 1.4rem;
        }
      }
    }
    .description {
      margin-top: 2.5rem;
    }
  }
}
</style>