import { ImgTagItem } from '../models/ImgTagItem'
import { ImgItem } from '../models/ImgItem'
import { ImgTagAccess } from '../dataLayer/imgTagAccess'
import { createLogger } from '../utils/logger'



const logger = createLogger('tags-BusinessLogic')

const imgTagAccess = new ImgTagAccess()

export async function getImagesByTag(userId: string,tag: string): Promise<ImgTagItem[]> {
    
    return await imgTagAccess.getImagesByTag(userId,tag)
}

//For every tag in igmItame.tags a new record will be added allowing direct query on tag name
export async function createTagsFromImgItem(
    imgItem: ImgItem
    ): Promise<void> {
    
      logger.info("createTagsFromImgItem Request",{  
        
      })
      
      const promises = []
      // Calling async function in parallel and waiting all promises to resolve
      for (const t in imgItem.tags){
          promises.push( 
          imgTagAccess.createImgTag({
              tagName: imgItem.tags[t].name,
              tagConfidence: parseFloat(imgItem.tags[t].confidence),
              imgId: imgItem.imgId,
              userId: imgItem.userId,
              name: imgItem.name,
              createdAt: imgItem.createdAt,
              attachmentUrl: imgItem.attachmentUrl,
              tags: imgItem.tags
              })
          )  
      }
      
      await Promise.all(promises)
      logger.info("createTagsFromImgItem ImageTagItem creation result",{  
        items: JSON.stringify(promises)
      })
      Promise.resolve    
      
    }