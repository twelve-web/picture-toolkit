export interface CanvasProps {
    imgFile: File;
    brushSize?: number;
    brushColor?: string;
    onMaskChange?: (originalBase64: string, maskBase64: string) => void;
  }
  interface Point {
    x: number;
    y: number;
  }
  interface DrawParams {
    offsetX: number;
    offsetY: number;
    drawWidth: number;
    drawHeight: number;
  }
  export class Eraser {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null;
    private maskCanvas: HTMLCanvasElement;
    private maskCtx: CanvasRenderingContext2D | null;
    private tempCanvas: HTMLCanvasElement;
    private tempCtx: CanvasRenderingContext2D | null;
    private originImage: HTMLImageElement | null = null;
    private container: HTMLElement | null = null;
    private _drawParams: DrawParams | null = null;
    private isDrawing = false; //是否按下鼠标 正在画
    private currentPath: Point[] = []; //当前绘制路径
  
    /** 事件处理函数 */
    private boundStartDrawing: (e: MouseEvent) => void; // 开始绘制的绑定事件处理函数
    private boundDraw: (e: MouseEvent) => void; // 绘制过程的绑定事件处理函数
    private boundStopDrawing: (e: MouseEvent) => void; // 结束绘制的绑定事件处理函数
    constructor(private props: CanvasProps) {
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d", { alpha: false });
      this.maskCanvas = document.createElement("canvas");
      this.maskCtx = this.maskCanvas.getContext("2d");
      this.tempCanvas = document.createElement("canvas");
      this.tempCtx = this.tempCanvas.getContext("2d");
      this.boundStartDrawing = this.startDrawing.bind(this);
      this.boundDraw = this.draw.bind(this);
      this.boundStopDrawing = this.stopDrawing.bind(this);
      this.canvas.addEventListener("mousedown", this.boundStartDrawing);
      this.canvas.addEventListener("mousemove", this.boundDraw);
      this.canvas.addEventListener("mouseup", this.boundStopDrawing);
      this.canvas.addEventListener("mouseleave", this.boundStopDrawing);
    }
    startDrawing(e: MouseEvent) {
      this.isDrawing = true;
      const point = this.getMousePosition(e);
      if (point) {
        this.currentPath = [point];
      }
    }
    draw(e: MouseEvent) {
      if (!this.isDrawing) return;
      const point = this.getMousePosition(e);
      if (point) {
        this.currentPath.push(point);
        this.drawPath();
      }
    }
    stopDrawing(_e: MouseEvent) {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      this.currentPath = [];
      
      // 触发蒙版变化事件
      if (this.props.onMaskChange) {
        const exportCanvas = document.createElement("canvas");
        const exportCtx = exportCanvas.getContext("2d");
        if (!exportCtx || !this._drawParams || !this.originImage) return;
  
        const { offsetX, offsetY, drawWidth, drawHeight } = this._drawParams;
        exportCanvas.width = this.canvas.width;
        exportCanvas.height = this.canvas.height;
  
        exportCtx.drawImage(
          this.originImage,
          0,
          0,
          this.originImage.width,
          this.originImage.height,
          offsetX,
          offsetY,
          drawWidth,
          drawHeight
        );
  
        this.props.onMaskChange(
          exportCanvas.toDataURL(),
          this.maskCanvas.toDataURL()
        );
      }
    }
    private drawPath() {
      if (!this.tempCtx || !this.maskCtx) return;
      // 绘制临时画布
      this.tempCtx.beginPath();
      this.tempCtx.moveTo(this.currentPath[0].x, this.currentPath[0].y);
      this.currentPath.forEach((point) => {
        this.tempCtx!.lineTo(point.x, point.y);
      });
      this.tempCtx.lineCap = "round";
      this.tempCtx.lineJoin = "round";
      this.tempCtx.strokeStyle = this.props.brushColor ?? "#000000";
      this.tempCtx.lineWidth = this.props.brushSize ?? 10;
      this.tempCtx.stroke();
      // 绘制蒙版
      this.maskCtx!.beginPath();
      this.maskCtx!.moveTo(this.currentPath[0].x, this.currentPath[0].y);
      this.currentPath.forEach((point) => {
        this.maskCtx!.lineTo(point.x, point.y);
      });
      this.maskCtx.lineCap = "round";
      this.maskCtx.lineJoin = "round";
      this.maskCtx.strokeStyle = "#ffffff";
      this.maskCtx.lineWidth = this.props.brushSize ?? 10;
      this.maskCtx.stroke();
  
      this.updateCanvas();
    }
    public mount(container: HTMLElement) {
      this.container = container;
      container.style.position = "relative";
      container.appendChild(this.canvas);
      this.loadImage();
    }
    public unmount() {
      this.container?.removeChild(this.canvas);
      this.destroy();
    }
    public destroy() {
      this.canvas.removeEventListener("mousedown", this.boundStartDrawing);
      this.canvas.removeEventListener("mousemove", this.boundDraw);
      this.canvas.removeEventListener("mouseup", this.boundStopDrawing);
      this.canvas.removeEventListener("mouseleave", this.boundStopDrawing);
    }
    private loadImage() {
      const img = new Image();
      img.src = URL.createObjectURL(this.props.imgFile);
      img.onload = () => {
        this.originImage = img;
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        URL.revokeObjectURL(img.src);
        this.uploadDrawParams();
      };
    }
    private uploadDrawParams() {
      if (!this.originImage || !this.container) return;
      const { width: originWidth, height: originHeight } = this.originImage;
      const { clientWidth: containerWidth, clientHeight: containerHeight } =
        this.container;
      const originRatio = originWidth / originHeight;
      const containerRatio = containerWidth / containerHeight;
      const { width, height } = this.calculateDimensions(
        containerWidth,
        containerHeight,
        originRatio,
        containerRatio
      );
      this.canvas.width = width;
      this.canvas.height = height;
      this._drawParams = {
        offsetX: 0,
        offsetY: 0,
        drawWidth: width,
        drawHeight: height,
      };
      this.setCanvasStyles(width, height);
      this.setCanvasDimensions(width, height);
  
      this.ctx?.drawImage(
        this.originImage,
        0,
        0,
        this.originImage.width,
        this.originImage.height,
        0,
        0,
        width,
        height
      );
      this.initializeMask(width, height);
    }
    /**
     * 计算画布的最终尺寸
     * @param containerWidth - 容器宽度
     * @param containerHeight - 容器高度
     * @param imageRatio - 原始图片的宽高比
     * @param containerRatio - 容器的宽高比
     * @returns {{ width: number, height: number }} 计算后的画布尺寸
     *
     * 计算逻辑：
     * 1. 如果图片比例大于容器比例（图片较宽），则以容器宽度为基准
     * 2. 如果图片比例小于容器比例（图片较高），则以容器高度为基准
     * 这样可以确保图片完整显示且不变形
     */
    private calculateDimensions(
      containerWidth: number,
      containerHeight: number,
      imageRatio: number,
      containerRatio: number
    ): { width: number; height: number } {
      if (imageRatio > containerRatio) {
        // 图片较宽的情况：使用容器宽度，高度按比例计算
        return {
          width: containerWidth, //同等高度下，图片比例比容器大所以宽度可能超出容器 占容器100% 1.5/1 1.2/1
          height: containerWidth / imageRatio,
        };
      } else {
        // 图片较高的情况：使用容器高度，宽度按比例计算
        return {
          width: containerHeight * imageRatio,
          height: containerHeight, //同等宽度下，图片比例比容器小所以高度可能超出容器 占容器100% 1/1.5 1/1.8
        };
      }
    }
  
    /**
     * 设置画布的CSS样式
     * @param width - 画布宽度
     * @param height - 画布高度
     *
     * 样式设置：
     * 1. 使用绝对定位
     * 2. 设置在容器中心点
     * 3. 使用transform进行居中偏移
     * 4. 设置实际显示尺寸
     */
    private setCanvasStyles(width: number, height: number) {
      Object.assign(this.canvas.style, {
        position: "absolute", // 使用绝对定位以便精确控制位置
        left: "50%", // 水平居中
        top: "50%", // 垂直居中
        transform: "translate(-50%, -50%)", // 补偿居中偏移
        width: `${width}px`, // 设置实际显示宽度
        height: `${height}px`, // 设置实际显示高度
      });
    }
    /**
     * 统一设置所有画布的尺寸
     * @param width - 画布宽度
     * @param height - 画布高度
     *
     * 包括：
     * - 主画布（this.canvas）：用于显示最终结果
     * - 蒙版画布（this.maskCanvas）：存储蒙版数据
     * - 临时画布（this.tempCanvas）：用于绘制过程
     */
    private setCanvasDimensions(width: number, height: number) {
      [this.canvas, this.maskCanvas, this.tempCanvas].forEach((canvas) => {
        canvas.width = width;
        canvas.height = height;
      });
    }
    private initializeMask(width: number, height: number) {
      if (!this.maskCtx) return;
      this.maskCtx.fillStyle = "#000000"; // 设置填充颜色为黑色
      this.maskCtx.fillRect(0, 0, width, height); // 填充整个画布
    }
    private getMousePosition(e: MouseEvent): Point | null {
      if (!this._drawParams) return null;
  
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
  
      return { x, y };
    }
    // 更新画布绘制
    private updateCanvas() {
      if (!this.originImage || !this._drawParams) {
        console.log("Cannot update canvas - missing image or draw params");
        return;
      }
  
      const { offsetX, offsetY, drawWidth, drawHeight } = this._drawParams;
      console.log("Updating canvas with params:", {
        offsetX,
        offsetY,
        drawWidth,
        drawHeight,
      });
      if (!this.ctx) return;
      // 清除整个画布
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
      // 保持图片原始比例绘制
      this.ctx.drawImage(
        this.originImage,
        0, // 源图像的 x 坐标
        0, // 源图像的 y 坐标
        this.originImage.width, // 源图像的宽度
        this.originImage.height, // 源图像的高度
        offsetX, // 目标位置的 x 坐标
        offsetY, // 目标位置的 y 坐标
        drawWidth, // 绘制的宽度
        drawHeight // 绘制的高度
      );
  
      // 绘制临时画布内容
      this.ctx.drawImage(
        this.tempCanvas,
        0,
        0,
        this.tempCanvas.width,
        this.tempCanvas.height,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight
      );
      this.notifyChange();
    }
    private notifyChange() {
      if (!this._drawParams || !this.originImage) return;
  
      const { offsetX, offsetY, drawWidth, drawHeight } = this._drawParams;
  
      if (this.props.onMaskChange) {
        const exportCanvas = document.createElement("canvas");
        const exportCtx = exportCanvas.getContext("2d");
        exportCanvas.width = this.canvas.width;
        exportCanvas.height = this.canvas.height;
        exportCtx?.drawImage(
          this.originImage,
          0, // 源图像的 x 坐标
          0, // 源图像的 y 坐标
          this.originImage.width, // 源图像的宽度
          this.originImage.height, // 源图像的高度
          offsetX, // 目标位置的 x 坐标
          offsetY, // 目标位置的 y 坐标
          drawWidth, // 绘制的宽度
          drawHeight // 绘制的高度
        );
        const originalBase64 = exportCanvas.toDataURL();
        const maskBase64 = this.maskCanvas.toDataURL();
        this.props.onMaskChange(originalBase64, maskBase64);
      }
    }
  }
  
  // 导出默认实例创建函数
  export const eraser = Eraser
  