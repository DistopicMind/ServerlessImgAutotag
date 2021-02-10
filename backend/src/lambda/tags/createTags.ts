import { SNSEvent, SNSHandler } from 'aws-lambda'
import 'source-map-support/register'



import { ImgItem } from '../../models/ImgItem'
import { createTagsFromImgItem } from '../../businessLogic/tags'

//Catch SNS event published on tags updated
// A new record in the DB will be created for every tag founded allowing direct query on tag
export const handler: SNSHandler = async (event: SNSEvent) => {
    console.log('Processing SNS event ', JSON.stringify(event))
    for (const snsRecord of event.Records) {
      const item = JSON.parse(snsRecord.Sns.Message) as ImgItem
      console.log('Processing record ', JSON.stringify(item))
      await createTagsFromImgItem(item)
      Promise.resolve()
      
    }
    
  }

