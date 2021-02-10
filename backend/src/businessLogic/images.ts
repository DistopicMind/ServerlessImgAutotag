import { ImgItem } from '../models/ImgItem'
import { ImgItemAccess } from '../dataLayer/imgItemAccess'
import { ImgIdAccess } from '../dataLayer/imgIdAccess'
import { CreateImgRequest } from '../requests/CreateImgRequest'
import { UpdateImgRequest } from '../requests/UpdateImgRequest'
import {createSignedUrl,getPublicUrl,deleteImageFile} from '../dataLayer/imgFileAccess'
import * as uuid from 'uuid'
import { createLogger } from '../utils/logger'

const logger = createLogger('images-BusinessLogic')

const imgItemAccess = new ImgItemAccess()
const imgIdAccess = new ImgIdAccess()


export async function getImages(userId: string): Promise<ImgItem[]> {
    logger.info("getAllImages Request",{
      userId: userId
    })
    return await imgItemAccess.getImages(userId)
}

export async function getImageById(userId: string, imgId: string): Promise<ImgItem> {
  logger.info("getImageById Request",{
    userId: userId,
    imgId: imgId
  })
  return await imgItemAccess.getImage(userId,imgId)
}

export async function createImg(
  createImgRequest: CreateImgRequest,
    userId: string
  ): Promise<ImgItem> {
    
    const imgId = uuid.v4()
    
    logger.info("createImg Request",{
      userId: userId,
      CreateImgRequest: createImgRequest
    })
  
    return await imgItemAccess.createImg({
      userId: userId,
      imgId: imgId,
      createdAt: new Date().toISOString(),
      name: createImgRequest.name,
            
    })
  }

  export async function updateImg(
    imgId :string,
    userId: string,
    updateImgRequest: UpdateImgRequest
  ): Promise<void> {

    logger.info("updateImg Request",{
      imgId :imgId,
      userId: userId,
      updateImgRequest: updateImgRequest
    })


    return await imgIdAccess.updateImgIdName(
      imgId,
      {
      name: updateImgRequest.name
      })
      
  }

  export async function generateUploadUrl(
    imgId :string,
    userId: string
  ): Promise<string> {

    
    const uploadUrl = await createSignedUrl(imgId)
    
    const publicUrl = await getPublicUrl(imgId)
    
    
    await imgItemAccess.updateImgUrl(imgId, userId,publicUrl)

    logger.info("generateUploadUrl Request Result",{
      userId: userId,
      imgId: imgId,
      uploadIUrl: uploadUrl,
      publicUrl: publicUrl
    })
      
    return uploadUrl  
  }
  //Delete all the record with same imgId (1 for image and n for n tag record)
  //Delete the file itsels
  export async function deleteImg(
    imgId :string,
    userId: string
  ): Promise<void> {
    const [res,delFileRes] = 
      await Promise.all([
        imgIdAccess.deleteImgId(
          imgId
        ),
        deleteImageFile(imgId)

    ])
    
    logger.info("deleteImg Request Result",{
      userId: userId,
      imgId: imgId,
      deleteFromDBResponse: res,
      deleteFromS3Response: delFileRes
    })
      
    return res
      
  } 
  