import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
//import { stream } from 'winston'
import { UpdateImgRequest } from '../../requests/UpdateImgRequest'
import { getImageById,updateImg } from '../../businessLogic/images'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateImg-Lambda')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const imgId = event.pathParameters.imgId
  const updateReq: UpdateImgRequest = JSON.parse(event.body)
  const userId = getUserId(event)
  logger.info("Received request: updateImg",
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

  await updateImg(imgId,userId,updateReq)
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
  
}
