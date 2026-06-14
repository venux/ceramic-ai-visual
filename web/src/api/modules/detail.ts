import request from '../request'

/** 详情页任务参数 */
export interface DetailTaskParams {
  productName: string
  sellingPoints: string[]
  productImage: string
  template: 'modern' | 'chinese' | 'japanese' | 'european'
}

/** 详情页任务 */
export interface DetailTask {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  htmlContent?: string
  previewImage?: string
  createdAt: string
  updatedAt: string
}

/** 创建详情页生成任务 */
export const createDetailTask = (data: DetailTaskParams) =>
  request.post<any, DetailTask>('/comfyui/detail-page', data)

/** 查询详情页任务进度 */
export const getDetailProgress = (taskId: string) =>
  request.get<any, DetailTask>(`/comfyui/progress/${taskId}`)

/** 建立 SSE 连接监听任务进度（返回 EventSource 实例） */
export const createDetailProgressSSE = (
  taskId: string,
  onMessage: (task: DetailTask) => void,
  onError?: (err: Event) => void,
) => {
  const baseURL = import.meta.env.BASE_URL + 'api'
  const token = localStorage.getItem('token')
  const url = `${baseURL}/comfyui/progress/${taskId}?token=${token || ''}`
  const es = new EventSource(url)

  es.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as DetailTask
      onMessage(data)
      if (data.status === 'completed' || data.status === 'failed') {
        es.close()
      }
    } catch {
      // ignore parse errors
    }
  }

  es.onerror = (err) => {
    onError?.(err)
    es.close()
  }

  return es
}
