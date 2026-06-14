import request from '../request'

export interface Task {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  images: string[]
  scenes: string[]
  platforms: string[]
  results?: string[]
  createdAt: string
  updatedAt: string
}

export const createTask = (data: {
  images: File[]
  scenes: string[]
  platforms: string[]
}) => {
  const formData = new FormData()
  data.images.forEach((file) => formData.append('images', file))
  data.scenes.forEach((scene) => formData.append('scenes', scene))
  data.platforms.forEach((platform) => formData.append('platforms', platform))
  return request.post<any, Task>('/tasks', formData)
}

export const getTasks = (params?: { page?: number; limit?: number }) =>
  request.get<any, { items: Task[]; total: number }>('/tasks', { params })

export const getTaskById = (id: string) =>
  request.get<any, Task>(`/tasks/${id}`)
