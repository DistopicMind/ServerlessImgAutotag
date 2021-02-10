import 'source-map-support/register'
import { getUserId } from '../utils'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getImagesByTag } from '../../businessLogic/tags'

const logger = createLogger('getImagesByTag-Lambda')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event)
  const tag = event.queryStringParameters.tag
  logger.info("Received request: getImagesByTag",
  { 
    callerEvent: event,
    userId: userId,
    tag: tag
  }
  )

  const items = await getImagesByTag(userId,tag)

  
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
