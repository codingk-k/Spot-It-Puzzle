import { post } from './request'

export function login(data) {
  return post('/auth/login', data)
}

export function logout() {
  return post('/auth/logout')
}

export function getProfile() {
  return post('/auth/profile')
}
