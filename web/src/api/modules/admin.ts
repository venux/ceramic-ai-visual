import request from '../request'

// ============ 类型定义 ============

export interface AdminDashboard {
  totalUsers: number
  todayNewUsers: number
  totalTasks: number
  totalImages: number
  trend: { date: string; count: number }[]
  recentTasks: AdminTask[]
}

export interface AdminUser {
  id: string
  nickname: string
  phone: string
  plan: string
  credits: number
  status: 'active' | 'disabled'
  createdAt: string
}

export interface AdminTask {
  id: string
  userId: string
  userName: string
  type: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  resultUrl?: string
}

export interface AdminScene {
  id: string
  name: string
  category: string
  thumbnail: string
  prompt: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// ============ Dashboard ============

export const getDashboard = () =>
  request.get<any, AdminDashboard>('/admin/dashboard')

// ============ 用户管理 ============

export const getUserList = (params: { page?: number; pageSize?: number; keyword?: string }) =>
  request.get<any, PageResult<AdminUser>>('/admin/users', { params })

export const updateUserCredits = (id: string, credits: number) =>
  request.put(`/admin/users/${id}/credits`, { credits })

export const updateUserPlan = (id: string, plan: string) =>
  request.put(`/admin/users/${id}/plan`, { plan })

export const toggleUserStatus = (id: string, status: 'active' | 'disabled') =>
  request.put(`/admin/users/${id}/status`, { status })

// ============ 任务管理 ============

export const getTaskList = (params: { page?: number; pageSize?: number; status?: string }) =>
  request.get<any, PageResult<AdminTask>>('/admin/tasks', { params })

export const getTaskDetail = (id: string) =>
  request.get<any, AdminTask>(`/admin/tasks/${id}`)

export const retryTask = (id: string) =>
  request.post(`/admin/tasks/${id}/retry`)

// ============ 场景管理 ============

export const getSceneList = () =>
  request.get<any, AdminScene[]>('/admin/scenes')

export const createScene = (data: Omit<AdminScene, 'id'>) =>
  request.post<any, AdminScene>('/admin/scenes', data)

export const updateScene = (id: string, data: Partial<AdminScene>) =>
  request.put<any, AdminScene>(`/admin/scenes/${id}`, data)

export const deleteScene = (id: string) =>
  request.delete(`/admin/scenes/${id}`)
