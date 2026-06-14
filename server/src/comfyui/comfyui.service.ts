import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  GenerateProductImageDto,
  GenerateDetailPageDto,
  TaskProgressEvent,
} from './dto/generate.dto';
import { configuration } from '../config/configuration';

/** 任务进度回调 */
export type ProgressCallback = (event: TaskProgressEvent) => void;

/** 内部任务状态 */
interface TaskState {
  id: string;
  status: 'queued' | 'processing' | 'compositing' | 'uploading' | 'completed' | 'failed';
  progress: number;
  resultUrls: string[];
  error?: string;
  callbacks: Set<ProgressCallback>;
}

@Injectable()
export class ComfyUIService {
  private readonly logger = new Logger(ComfyUIService.name);
  private readonly mode: 'mock' | 'real';
  private readonly comfyuiUrl: string;
  private readonly tasks = new Map<string, TaskState>();

  constructor() {
    this.mode = (process.env.COMFYUI_MODE as 'mock' | 'real') || 'mock';
    this.comfyuiUrl = configuration().comfyui_url;
    this.logger.log(`ComfyUI 模式: ${this.mode}, API地址: ${this.comfyuiUrl}`);
  }

  // ──────────────────────────────── 任务管理 ────────────────────────────────

  /** 创建任务并注册进度回调 */
  createTask(): TaskState {
    const taskId = uuidv4();
    const task: TaskState = {
      id: taskId,
      status: 'queued',
      progress: 0,
      resultUrls: [],
      callbacks: new Set(),
    };
    this.tasks.set(taskId, task);
    return task;
  }

  /** 订阅任务进度 */
  subscribeTask(taskId: string, cb: ProgressCallback): () => void {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`任务 ${taskId} 不存在`);
    }
    task.callbacks.add(cb);
    // 立即推送当前状态
    cb(this.buildEvent(task));
    return () => task.callbacks.delete(cb);
  }

  /** 获取任务当前状态（用于非SSE场景） */
  getTask(taskId: string): TaskState | undefined {
    return this.tasks.get(taskId);
  }

  private emit(task: TaskState) {
    const event = this.buildEvent(task);
    for (const cb of task.callbacks) {
      try {
        cb(event);
      } catch (e) {
        this.logger.warn(`推送进度回调失败: ${e}`);
      }
    }
  }

  private buildEvent(task: TaskState): TaskProgressEvent {
    return new TaskProgressEvent({
      taskId: task.id,
      stage: task.status,
      progress: task.progress,
      message: this.stageMessage(task.status, task.progress),
      resultUrls: task.resultUrls.length > 0 ? task.resultUrls : undefined,
      error: task.error,
    });
  }

  private stageMessage(stage: string, progress: number): string {
    const map: Record<string, string> = {
      queued: '排队中…',
      processing: 'AI 生成中…',
      compositing: '合成中…',
      uploading: '上传中…',
      completed: '生成完成',
      failed: '生成失败',
    };
    return `${map[stage] || stage} (${progress}%)`;
  }

  // ──────────────────────────────── 核心能力 ────────────────────────────────

  /**
   * 生成产品图 — 主入口
   * 异步执行，通过 taskId 订阅进度
   */
  async generateProductImages(
    imagePath: string,
    sceneId: string,
    platforms: string[],
  ): Promise<string> {
    const task = this.createTask();
    // 异步执行，不阻塞返回 taskId
    this.executeGenerate(task, imagePath, sceneId, platforms).catch((err) => {
      this.logger.error(`生成失败: ${err.message}`, err.stack);
      task.status = 'failed';
      task.error = err.message;
      task.progress = 0;
      this.emit(task);
    });
    return task.id;
  }

  /**
   * 抠图 — SAM2
   */
  async removeBackground(imagePath: string): Promise<string> {
    const task = this.createTask();
    this.executeRemoveBg(task, imagePath).catch((err) => {
      this.logger.error(`抠图失败: ${err.message}`, err.stack);
      task.status = 'failed';
      task.error = err.message;
      this.emit(task);
    });
    return task.id;
  }

  /**
   * 生成详情页 — LLM
   */
  async generateDetailPage(
    productName: string,
    sellingPoints: string[],
    images?: string[],
  ): Promise<string> {
    const task = this.createTask();
    this.executeDetailPage(task, productName, sellingPoints, images).catch((err) => {
      this.logger.error(`详情页生成失败: ${err.message}`, err.stack);
      task.status = 'failed';
      task.error = err.message;
      this.emit(task);
    });
    return task.id;
  }

  // ──────────────────────────────── 执行层（mock / real） ────────────────────────────────

  private async executeGenerate(
    task: TaskState,
    imagePath: string,
    sceneId: string,
    platforms: string[],
  ): Promise<void> {
    if (this.mode === 'mock') {
      await this.mockGenerate(task, platforms);
    } else {
      await this.realGenerate(task, imagePath, sceneId, platforms);
    }
  }

  private async executeRemoveBg(task: TaskState, imagePath: string): Promise<void> {
    if (this.mode === 'mock') {
      await this.mockRemoveBg(task);
    } else {
      await this.realRemoveBg(task, imagePath);
    }
  }

  private async executeDetailPage(
    task: TaskState,
    productName: string,
    sellingPoints: string[],
    images?: string[],
  ): Promise<void> {
    if (this.mode === 'mock') {
      await this.mockDetailPage(task, productName);
    } else {
      await this.realDetailPage(task, productName, sellingPoints, images);
    }
  }

  // ──────────────────────────────── Mock 实现 ────────────────────────────────

  private async mockGenerate(task: TaskState, platforms: string[]): Promise<void> {
    task.status = 'processing';
    task.progress = 10;
    this.emit(task);
    await this.sleep(1000);

    task.progress = 50;
    this.emit(task);
    await this.sleep(1000);

    task.status = 'compositing';
    task.progress = 80;
    this.emit(task);
    await this.sleep(500);

    task.status = 'uploading';
    task.progress = 95;
    this.emit(task);
    await this.sleep(500);

    // 返回占位图
    task.resultUrls = platforms.map(
      (p) => `https://via.placeholder.com/800x800?text=${p}_${task.id.slice(0, 8)}`,
    );
    task.status = 'completed';
    task.progress = 100;
    this.emit(task);
  }

  private async mockRemoveBg(task: TaskState): Promise<void> {
    task.status = 'processing';
    task.progress = 30;
    this.emit(task);
    await this.sleep(1500);

    task.progress = 70;
    this.emit(task);
    await this.sleep(1000);

    task.resultUrls = [
      `https://via.placeholder.com/800x800/transparent?text=nobg_${task.id.slice(0, 8)}`,
    ];
    task.status = 'completed';
    task.progress = 100;
    this.emit(task);
  }

  private async mockDetailPage(task: TaskState, productName: string): Promise<void> {
    task.status = 'processing';
    task.progress = 20;
    this.emit(task);
    await this.sleep(1000);

    task.progress = 60;
    this.emit(task);
    await this.sleep(1000);

    task.resultUrls = [
      `https://via.placeholder.com/750x2000?text=detail_${encodeURIComponent(productName)}`,
    ];
    task.status = 'completed';
    task.progress = 100;
    this.emit(task);
  }

  // ──────────────────────────────── Real 实现 ────────────────────────────────

  private async realGenerate(
    task: TaskState,
    imagePath: string,
    sceneId: string,
    platforms: string[],
  ): Promise<void> {
    task.status = 'processing';
    task.progress = 5;
    this.emit(task);

    const workflow = this.buildProductWorkflow(imagePath, sceneId, platforms);
    const promptId = await this.submitWorkflow(workflow);

    // 轮询 ComfyUI 进度
    task.progress = 10;
    this.emit(task);
    const outputImages = await this.pollProgress(promptId, task);

    task.status = 'compositing';
    task.progress = 85;
    this.emit(task);

    // 下载输出图片
    task.resultUrls = outputImages.map((img) => this.buildOutputUrl(img));

    task.status = 'completed';
    task.progress = 100;
    this.emit(task);
  }

  private async realRemoveBg(task: TaskState, imagePath: string): Promise<void> {
    task.status = 'processing';
    task.progress = 5;
    this.emit(task);

    const workflow = this.buildSAM2Workflow(imagePath);
    const promptId = await this.submitWorkflow(workflow);

    task.progress = 10;
    this.emit(task);
    const outputImages = await this.pollProgress(promptId, task);

    task.resultUrls = outputImages.map((img) => this.buildOutputUrl(img));
    task.status = 'completed';
    task.progress = 100;
    this.emit(task);
  }

  private async realDetailPage(
    task: TaskState,
    productName: string,
    sellingPoints: string[],
    images?: string[],
  ): Promise<void> {
    task.status = 'processing';
    task.progress = 10;
    this.emit(task);

    // 通过 ComfyUI 调用 LLM 节点生成详情页
    const workflow = this.buildDetailPageWorkflow(productName, sellingPoints, images);
    const promptId = await this.submitWorkflow(workflow);

    task.progress = 30;
    this.emit(task);
    const outputImages = await this.pollProgress(promptId, task);

    task.resultUrls = outputImages.map((img) => this.buildOutputUrl(img));
    task.status = 'completed';
    task.progress = 100;
    this.emit(task);
  }

  // ──────────────────────────────── ComfyUI API 交互 ────────────────────────────────

  /** 提交 workflow 到 ComfyUI */
  private async submitWorkflow(workflow: Record<string, any>): Promise<string> {
    const res = await fetch(`${this.comfyuiUrl}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`ComfyUI API 错误 ${res.status}: ${body}`);
    }

    const data = (await res.json()) as { prompt_id: string };
    this.logger.log(`ComfyUI prompt 已提交: ${data.prompt_id}`);
    return data.prompt_id;
  }

  /** 轮询 ComfyUI 任务进度，返回输出图片列表 */
  private async pollProgress(
    promptId: string,
    task: TaskState,
  ): Promise<Array<{ filename: string; subfolder: string; type: string }>> {
    const maxWait = 300_000; // 5 分钟超时
    const interval = 2_000;
    let elapsed = 0;

    while (elapsed < maxWait) {
      await this.sleep(interval);
      elapsed += interval;

      const res = await fetch(`${this.comfyuiUrl}/history/${promptId}`);
      if (!res.ok) continue;

      const data = (await res.json()) as Record<string, any>;
      const history = data[promptId];

      if (!history) {
        // 尚未完成，尝试获取队列状态
        const queueRes = await fetch(`${this.comfyuiUrl}/queue`);
        if (queueRes.ok) {
          const queueData = (await queueRes.json()) as any;
          const inQueue = queueData.queue_running?.length || 0;
          const pending = queueData.queue_pending?.length || 0;
          task.progress = Math.min(80, 10 + Math.floor((elapsed / maxWait) * 70));
          task.status = 'processing';
          this.emit(task);
        }
        continue;
      }

      // 任务完成，提取输出图片
      const outputs = history.outputs as Record<string, any>;
      const images: Array<{ filename: string; subfolder: string; type: string }> = [];

      for (const nodeId of Object.keys(outputs)) {
        const nodeOutput = outputs[nodeId];
        if (nodeOutput.images) {
          images.push(...nodeOutput.images);
        }
      }

      if (images.length === 0) {
        throw new Error('ComfyUI 任务完成但无输出图片');
      }

      return images;
    }

    throw new Error('ComfyUI 任务超时（5分钟）');
  }

  /** 构建输出图片 URL */
  private buildOutputUrl(img: { filename: string; subfolder: string; type: string }): string {
    const params = new URLSearchParams({
      filename: img.filename,
      subfolder: img.subfolder,
      type: img.type || 'output',
    });
    return `${this.comfyuiUrl}/view?${params.toString()}`;
  }

  // ──────────────────────────────── Workflow 构建 ────────────────────────────────

  private buildProductWorkflow(
    imagePath: string,
    sceneId: string,
    platforms: string[],
  ): Record<string, any> {
    return {
      prompt: {
        '1': {
          class_type: 'LoadImage',
          inputs: { image: imagePath },
        },
        '2': {
          class_type: 'SAM2Segment',
          inputs: {
            image: ['1', 0],
            model: 'sam2_hiera_large',
          },
        },
        '3': {
          class_type: 'ControlNetApply',
          inputs: {
            conditioning: ['2', 0],
            control_net_name: 'control_v11p_sd15_canny',
            strength: 0.75,
          },
        },
        '4': {
          class_type: 'KSampler',
          inputs: {
            model: ['scene_loader', 0],
            positive: ['3', 0],
            negative: ['5', 0],
            latent_image: ['6', 0],
            seed: Math.floor(Math.random() * 2 ** 32),
            steps: 30,
            cfg: 7.5,
            sampler_name: 'euler_ancestral',
            scheduler: 'normal',
            denoise: 0.85,
          },
        },
        '5': {
          class_type: 'CLIPTextEncode',
          inputs: { text: 'low quality, blurry, watermark', clip: ['clip_loader', 0] },
        },
        '6': {
          class_type: 'EmptyLatentImage',
          inputs: { width: 1024, height: 1024, batch_size: 1 },
        },
        '7': {
          class_type: 'SaveImage',
          inputs: { images: ['4', 0], filename_prefix: `product_${sceneId}` },
        },
        scene_loader: {
          class_type: 'CheckpointLoaderSimple',
          inputs: { ckpt_name: `scene_${sceneId}.safetensors` },
        },
        clip_loader: {
          class_type: 'CLIPTextEncode',
          inputs: {
            text: 'professional product photography, ceramic, studio lighting',
            clip: ['scene_loader', 1],
          },
        },
      },
    };
  }

  private buildSAM2Workflow(imagePath: string): Record<string, any> {
    return {
      prompt: {
        '1': {
          class_type: 'LoadImage',
          inputs: { image: imagePath },
        },
        '2': {
          class_type: 'SAM2Segment',
          inputs: {
            image: ['1', 0],
            model: 'sam2_hiera_large',
            mode: 'automatic',
          },
        },
        '3': {
          class_type: 'RemoveBackground',
          inputs: {
            image: ['1', 0],
            mask: ['2', 0],
          },
        },
        '4': {
          class_type: 'SaveImage',
          inputs: {
            images: ['3', 0],
            filename_prefix: 'nobg',
          },
        },
      },
    };
  }

  private buildDetailPageWorkflow(
    productName: string,
    sellingPoints: string[],
    images?: string[],
  ): Record<string, any> {
    return {
      prompt: {
        '1': {
          class_type: 'LLMGenerate',
          inputs: {
            prompt: `为陶瓷产品"${productName}"生成电商详情页。\n卖点：${sellingPoints.join('、')}\n要求：图文结合，突出产品特色，适合手机端浏览。`,
            model: 'gpt-4o',
            max_tokens: 4000,
          },
        },
        '2': {
          class_type: 'HTMLRenderer',
          inputs: {
            content: ['1', 0],
            width: 750,
            format: 'jpg',
          },
        },
        '3': {
          class_type: 'SaveImage',
          inputs: {
            images: ['2', 0],
            filename_prefix: `detail_${productName}`,
          },
        },
      },
    };
  }

  // ──────────────────────────────── 工具方法 ────────────────────────────────

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
