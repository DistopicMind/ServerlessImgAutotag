import 'source-map-support/register'
import { getImageById } from '../../businessLogic/images'
import { getUserId } from '../utils'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'

const logger = createLogger('getImg-Lambda')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event)
  const imgId = event.pathParameters.imgId
  logger.info("Received request: getImg",
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

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: item
    })
  }
}
