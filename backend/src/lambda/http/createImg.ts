import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateImgRequest } from '../../requests/CreateImgRequest'
import { createImg } from '../../businessLogic/images'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createImg-Lambda')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newImg: CreateImgRequest = JSON.parse(event.body)
  const userId = getUserId(event)
  logger.info("Received request: create new Img",
  { 
    callerEvent: event,
    userId: userId
  }
  )
  const item = await createImg(newImg,userId)
  
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: item
    })
  }


}
