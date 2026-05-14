import { post } from './request'

export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return post('/admin/upload/image', formData)
}

export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return post('/admin/upload/file', formData)
}
