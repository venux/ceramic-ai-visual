import request from '../request'

export interface UserInfo {
  id: string
  nickname: string
  avatar: string
  plan: string
  credits: number
}

export const getMe = () =>
  request.get<any, UserInfo>('/users/me')

export const getCredits = () =>
  request.get<any, { credits: number }>('/users/credits')
