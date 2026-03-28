// 存储主光标实例
let mainCursor;

// 添加线性插值函数到Math对象，用于平滑移动效果
// 参数 a: 起始值, b: 结束值, n: 插值系数(0-1之间)
Math.lerp = (a, b, n) => (1 - n) * a + n * b;

// 获取元素指定CSS属性的值
// 参数 el: DOM元素, attr: CSS属性名
const getStyle = (el, attr) => {
  try {
    // 现代浏览器使用getComputedStyle，旧版IE使用currentStyle
    return window.getComputedStyle ? window.getComputedStyle(el)[attr] : el.currentStyle[attr];
  } catch (e) {
    console.error(e);
  }
  return false;
};

// 初始化自定义光标
// 创建并返回新的Cursor实例
const cursorInit = () => {
  mainCursor = new Cursor();
  return mainCursor;
};

// 自定义光标类
class Cursor {
  constructor() {
    // 存储光标位置信息
    this.pos = {
      curr: null,  // 当前位置
      prev: null,  // 上一位置
    };
    // 存储具有pointer样式的元素
    this.pt = [];
    
    // 执行初始化步骤
    this.create();  // 创建光标DOM元素
    this.init();    // 初始化事件监听
    this.render();  // 开始渲染循环
  }

  // 移动光标到指定位置
  // 参数 left: 左偏移, top: 上偏移
  move(left, top) {
    this.cursor.style["left"] = `${left}px`;
    this.cursor.style["top"] = `${top}px`;
  }

  // 创建自定义光标DOM元素
  create() {
    // 如果光标元素不存在，则创建它
    if (!this.cursor) {
      this.cursor = document.createElement("div");
      this.cursor.id = "cursor";  // 设置ID
      this.cursor.classList.add("xs-hidden");  // 添加隐藏类（针对小屏幕）
      this.cursor.classList.add("hidden");     // 添加隐藏类
      document.body.append(this.cursor);  // 添加到文档主体
    }

    // 查找所有具有pointer光标样式的元素
    var el = document.getElementsByTagName("*");
    for (let i = 0; i < el.length; i++)
      if (getStyle(el[i], "cursor") == "pointer") this.pt.push(el[i].outerHTML);

    // 创建并注入全局光标样式，替换系统光标
    document.body.appendChild((this.scr = document.createElement("style")));
    this.scr.innerHTML = `* {cursor: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8' width='10px' height='10px'><circle cx='4' cy='4' r='4' fill='white' /></svg>") 4 4, auto !important}`;
  }

  // 刷新光标状态
  refresh() {
    // 清理现有样式和状态
    this.scr.remove();
    this.cursor.classList.remove("active");
    this.pos = {
      curr: null,
      prev: null,
    };
    this.pt = [];

    // 重新执行初始化流程
    this.create();
    this.init();
    this.render();
  }

  // 初始化事件监听器
  init() {
    // 鼠标移动事件：更新光标位置
    document.onmousemove = (e) => {
      // 如果是首次移动，立即定位到鼠标位置
      this.pos.curr == null && this.move(e.clientX - 8, e.clientY - 8);
      // 更新当前位置
      this.pos.curr = {
        x: e.clientX - 8,  // 减去偏移量以居中光标
        y: e.clientY - 8,
      };
      // 显示光标
      this.cursor.classList.remove("hidden");
    };
    
    // 鼠标进入文档：显示光标
    document.onmouseenter = () => this.cursor.classList.remove("hidden");
    
    // 鼠标离开文档：隐藏光标
    document.onmouseleave = () => this.cursor.classList.add("hidden");
    
    // 鼠标按下：添加活动状态
    document.onmousedown = () => this.cursor.classList.add("active");
    
    // 鼠标释放：移除活动状态
    document.onmouseup = () => this.cursor.classList.remove("active");
  }

  // 渲染循环：实现平滑移动效果
  render() {
    if (this.pos.prev) {
      // 使用线性插值计算平滑过渡的位置
      this.pos.prev.x = Math.lerp(this.pos.prev.x, this.pos.curr.x, 0.35);
      this.pos.prev.y = Math.lerp(this.pos.prev.y, this.pos.curr.y, 0.35);
      // 移动光标到插值后的位置
      this.move(this.pos.prev.x, this.pos.prev.y);
    } else {
      // 首次渲染时，将当前位置复制给上一位置
      this.pos.prev = this.pos.curr;
    }
    // 使用requestAnimationFrame保持渲染循环
    requestAnimationFrame(() => this.render());
  }
}

// 导出初始化函数
export default cursorInit;