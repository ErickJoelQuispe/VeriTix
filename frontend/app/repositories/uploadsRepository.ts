export interface SignedUpload {
  signature: string
  timestamp: number
  apiKey: string
  cloudName: string
  folder: string
}

const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1'

export function useUploadsRepository() {
  const apiRequest = useApiRequest()

  async function signUpload(folder: 'events' | 'artists' | 'venues'): Promise<SignedUpload> {
    return apiRequest<SignedUpload>('/admin/uploads/sign', {
      method: 'POST',
      body: { folder },
    })
  }

  async function uploadImage(file: File, folder: 'events' | 'artists' | 'venues'): Promise<string> {
    const signed = await signUpload(folder)
    const formData = new FormData()

    formData.append('file', file)
    formData.append('api_key', signed.apiKey)
    formData.append('timestamp', String(signed.timestamp))
    formData.append('signature', signed.signature)
    formData.append('folder', signed.folder)

    const response = await fetch(`${CLOUDINARY_UPLOAD_URL}/${signed.cloudName}/auto/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error')

      throw new Error(`Failed to upload image: ${response.status} — ${errorBody}`)
    }

    const result = await response.json() as { secure_url?: string, url?: string }

    return result.secure_url ?? result.url ?? ''
  }

  return { signUpload, uploadImage }
}
