import 'source-map-support/register'
import { getImageById,generateUploadUrl } from '../../businessLogic/images'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUplodUrl-Lambda')

// Return a presigned URL to upload a file for a IMG item with the provided id
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const imgId = event.pathParameters.imgId
  const userId = await getUserId(event)
  
  logger.info("Received request: generateUplodUrl",
  { 
    callerEvent: event,
    userId: userId,
    imgId: imgId
  }
  )
  
  //Checking if image exist
  const item = await getImageById(userId,imgId)

  
  if (!item) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: `imgId: ${imgId} does not exist`
      })
    }
  }  
  //Preventing the client to be able to change uploaded image (tags managment involved)
  if (!!item.attachmentUrl) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: `Upload url for imgId: ${imgId} can be requested only once per img, delete Image and retry`
      })
    }
  } 

  const url = await generateUploadUrl(imgId,userId)
  
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
  
  
}
