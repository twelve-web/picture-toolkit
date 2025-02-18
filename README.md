# Image Editor 🎨

一个轻量级的图片编辑器组件库，支持任何前端框架。✨
- 目前支持擦除图片功能(返回原图和擦除部分的mask)

## 特性 🌟
- 支持自由绘制蒙版 ✍️
- 自动保持图片原始比例 🔄
- 精确的鼠标位置追踪 🖱️
- 实时预览编辑效果 👀
- 高性能画布渲染 🚀

## 安装 🛠️

```bash
npm install picture-toolkit
```


## 使用示例 📦
![demo image](http://static.markweb.top/static/demo.png)
### Vue 3:
```js
// 示例代码
<template>
  <div>
    <h1> Vue Demo!</h1>
    <div class="container" ref="container"></div>
    <input type="file" @change="handleFileChange" />
  </div>
</template>
<script  lang="ts">
import {Eraser} from 'picture-toolkit'

export default {
  name: 'App',
  data() {
    return {
      imgFile: null,
      eraser: null
    }
  },
  methods: {
    handleFileChange(e:any) {
      this.imgFile = e.target.files[0]
      this.initEarser()
    },
    initEarser() {
      if(this.imgFile) {
        this.eraser = new Eraser({
          imgFile: this.imgFile,
          onMaskChange: (originalBase64, maskBase64) => {
            console.log(originalBase64, maskBase64,'===')
          }
        })
        this.$nextTick(() => {
          this.eraser.mount(this.$refs.container)
        })
      }
    },
  },
}
</script>
```

### React:
```js
// 示例代码
import { useEffect, useRef, useState } from 'react'
import { Eraser } from 'picture-toolkit'

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [imgFile, setImgFile] = useState<File | null>(null)
  const [eraser, setEarser] = useState<Eraser | null>(null)
  const [imgList, setImgList] = useState<string[]>([])
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImgFile(file)
    }
  }

  useEffect(() => {
    if (imgFile && containerRef.current) {
      const newEarser = new Eraser({
        imgFile: imgFile,
        onMaskChange: (originalBase64: string, maskBase64: string) => {
          console.log(originalBase64, maskBase64, '===')
          setImgList([ originalBase64, maskBase64])
        }
      })
      
      newEarser.mount(containerRef.current)
      setEarser(newEarser)
    }
  }, [imgFile])



  return (
    <div>
      <h1>Eraser React Demo</h1>
      <div 
        ref={containerRef} 
        style={{
          width: '500px',
          height: '500px',
          border: '1px solid #000'
        }}
      ></div>
      <input type="file" onChange={handleFileChange} />
      {imgList.map((item, index) => (
        <img key={index} className='img' style={{width: '100px', height: '100px'}} src={item} alt="img" />
      ))}
    </div>
  ) 
}

export default App 
```

## API 📑

### Props 属性:
- **imgFile**: `File` 类型，必填，要编辑的图片文件 🖼️
- **brushSize**: `number` 类型，可选，默认 `20`，画笔大小 🖌️
- **brushColor**: `string` 类型，可选，默认 `rgba(0,0,0,0.6)`，画笔颜色 🎨

### Events 事件:
- **maskChange**: 蒙版变化时触发，参数 `(originalBase64, maskBase64)` ⚡

## 本地开发 💻

### 安装依赖:
```bash
yarn install
```

### 启动 Vue 示例:
```bash
yarn dev:vue
```

### 启动 React 示例:
```bash
yarn dev:react
```

### 构建所有包:
```bash
yarn build
```

### 清理构建文件和依赖:
```bash
yarn clean
```

## 项目结构 📁
```
.
├── examples/              # 示例项目
│   ├── vue/              # Vue 示例项目
│   │   ├── src/         # 源代码目录
│   │   │   ├── App.vue  # 主应用组件
│   │   │   └── main.ts  # 入口文件
│   │   ├── index.html   # HTML 模板
│   │   ├── vite.config.ts # Vite 配置
│   │   └── package.json # 项目配置
│   │
│   └── react/           # React 示例项目
│       ├── src/         # 源代码目录
│       │   ├── App.tsx  # 主应用组件
│       │   └── main.tsx # 入口文件
│       ├── index.html   # HTML 模板
│       ├── tsconfig.json # TypeScript 配置
│       ├── tsconfig.node.json # Node TypeScript 配置
│       ├── vite.config.ts # Vite 配置
│       └── package.json # 项目配置
│
└── README.md           # 项目说明文档