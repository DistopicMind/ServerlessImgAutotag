import 'source-map-support/register'
import { getImages } from '../../businessLogic/images'
import { getUserId } from '../utils'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'

const logger = createLogger('getImages-Lambda')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event)

  logger.info("Received request: getImages",
  { 
    callerEvent: event,
    userId: userId
  }
  )
  //Items will be returned LIFO 
  const items = await getImages(userId)

  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items: items
    })
  }
}
