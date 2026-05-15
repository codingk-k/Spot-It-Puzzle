import { get, post, put, del } from './request'

export function getLevelList(params) {
  return get('/admin/levels', params)
}

export function getLevelDetail(id) {
  return get(`/admin/levels/${id}`)
}

export function createLevel(data) {
  return post('/admin/levels', data)
}

export function updateLevel(id, data) {
  return put(`/admin/levels/${id}`, data)
}

export function deleteLevel(id) {
  return del(`/admin/levels/${id}`)
}

export function publishLevel(id) {
  return post(`/admin/levels/${id}/publish`)
}

export function offlineLevel(id) {
  return post(`/admin/levels/${id}/offline`)
}

export function getLevelDiffs(id) {
  return get(`/admin/levels/${id}/diffs`)
}

export function saveLevelDiffs(id, data) {
  return post(`/admin/levels/${id}/diffs`, data)
}

export function deleteLevelDiff(levelId, diffId) {
  return del(`/admin/levels/${levelId}/diffs/${diffId}`)
}
