import request from '../request'

export interface Scene {
  id: string
  name: string
  category: string
  thumbnail: string
  description?: string
}

export const getScenes = () =>
  request.get<any, Scene[]>('/scenes')

export const getScenesByCategory = (category: string) =>
  request.get<any, Scene[]>(`/scenes/category/${category}`)
