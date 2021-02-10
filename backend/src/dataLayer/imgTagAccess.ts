import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { ImgTagItem } from '../models/ImgTagItem'





export class ImgTagAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly imagesTable = process.env.IMAGES_TABLE,
    private readonly imagesIndex = process.env.IMAGES_CREATED_AT_INDEX
    
    ) {
  }

  async getImagesByTag(userId: string, tag: string): Promise<ImgTagItem[]> {
    console.log('imgTagAccess.getImages function')
    var params: AWS.DynamoDB.DocumentClient.QueryInput = {
      TableName : this.imagesTable,
      IndexName : this.imagesIndex,
      ScanIndexForward: false,
      ProjectionExpression: "imgId, createdAt, #n, tags, attachmentUrl",
      KeyConditionExpression: "#p = :uid",
      ExpressionAttributeNames:{
          "#p": "PK",
          "#n": "name"

      },
      ExpressionAttributeValues: {
          ":uid": `USER#${userId}#-TAG#${tag}#`
      }
    }
    const result = await this.docClient.query(params).promise()

    const items = result.Items
    return items as ImgTagItem[]
  }

  async createImgTag(imgTagItem: ImgTagItem): Promise<ImgTagItem> {
    console.log('imgTagAccess.CreateImgTag function')
    console.log('Put tag item: ' + JSON.stringify(imgTagItem))
    imgTagItem.PK = `USER#${imgTagItem.userId}#-TAG#${imgTagItem.tagName}#`
    imgTagItem.SK = imgTagItem.imgId
   
    await this.docClient.put({
      TableName: this.imagesTable,
      Item: imgTagItem
    }).promise()
    
    return imgTagItem
  }

}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}