import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'
import { getImageById,deleteImg } from '../../businessLogic/images'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteImage-Lambda')


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const imgId = event.pathParameters.imgId
  const userId = getUserId(event)
  logger.info("Received request: delete Image",
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

  await deleteImg(imgId,userId)
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
  
}
