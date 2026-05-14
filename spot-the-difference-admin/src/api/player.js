import { get, put } from './request'

export function getPlayerList(params) {
  return get('/admin/players', params)
}

export function getPlayerDetail(id) {
  return get(`/admin/players/${id}`)
}

export function banPlayer(id) {
  return put(`/admin/players/${id}/ban`)
}

export function unbanPlayer(id) {
  return put(`/admin/players/${id}/unban`)
}
