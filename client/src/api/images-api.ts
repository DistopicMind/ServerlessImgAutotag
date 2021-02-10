import { apiEndpoint } from '../config'
import { ImgItem } from '../types/ImgItem';
import { CreateImgRequest } from '../types/CreateImgRequest';
import Axios from 'axios'
import { UpdateImgRequest } from '../types/UpdateImgRequest';


export async function getImages(idToken: string): Promise<ImgItem[]> {
  console.log('Fetching Images')

  const response = await Axios.get(`${apiEndpoint}/images`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Images:', response.data)
  return response.data.items
}

export async function createImg(
  idToken: string,
  newImg: CreateImgRequest
): Promise<ImgItem> {
  const response = await Axios.post(`${apiEndpoint}/images`,  JSON.stringify(newImg), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchImg(
  idToken: string,
  imgId: string,
  updatedImg: UpdateImgRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/images/${imgId}`, JSON.stringify(updatedImg), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteImg(
  idToken: string,
  imgId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/images/${imgId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  imgId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/images/${imgId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
