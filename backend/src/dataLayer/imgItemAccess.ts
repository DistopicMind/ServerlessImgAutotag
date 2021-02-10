import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { ImgItem } from '../models/ImgItem'





export class ImgItemAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly imagesTable = process.env.IMAGES_TABLE,
    private readonly imagesIndex = process.env.IMAGES_CREATED_AT_INDEX,
    private readonly imagesIdIndex = process.env.IMAGESID_INDEX

    ) {
  }

  async getImages(userId: string): Promise<ImgItem[]> {
    console.log('imgAccess.getImages function')
    var params = {
      TableName : this.imagesTable,
      IndexName : this.imagesIndex,
      ScanIndexForward: false,
      KeyConditionExpression: "#p = :uid",
      ExpressionAttributeNames:{
          "#p": "PK",
          "#n": "name"
      },
      ExpressionAttributeValues: {
          ":uid": `USER#${userId}#-IMG`
      },
      ProjectionExpression: "imgId, createdAt, #n, tags, attachmentUrl"
    }
    const result = await this.docClient.query(params).promise()

    const items = result.Items
    return items as ImgItem[]
  }

  async getImage(userId: string, imgId: string): Promise<ImgItem> {
    console.log('imgAccess.getImage function')
    var params = {
      TableName : this.imagesTable,
      KeyConditionExpression: "#p = :uid and #s = :img",
      ExpressionAttributeNames:{
          "#p": "PK",
          "#s": "SK",
          "#n": "name"
      },
      ExpressionAttributeValues: {
          ":uid": `USER#${userId}#-IMG`,
          ":img": imgId
      },
      ProjectionExpression: "imgId, createdAt, #n, tags, attachmentUrl"
    }
    const result = await this.docClient.query(params).promise()

    const items = result.Items
    return items[0] as ImgItem
  }

  async createImg(imgItem: ImgItem): Promise<ImgItem> {
    console.log('imgAccess.CreateImg function')
    console.log('Put item: ' + JSON.stringify(imgItem))
     var imgRecord: ImgItem = {
        PK: 'USER#'+ imgItem.userId + '#-IMG',
        SK: imgItem.imgId,
        imgId: imgItem.imgId,
        userId: imgItem.userId,
        name: imgItem.name,
        createdAt: imgItem.createdAt 

     }

    await this.docClient.put({
      TableName: this.imagesTable,
      Item: imgRecord
    }).promise()
    
    return imgItem
  }

  async updateImgUrl(imgId: string, userId: string, url: string): Promise<void> {
    console.log(`imgAccess.updateImgUrl function!`)
    const params = {
      TableName: this.imagesTable,
      Key: {
          PK: `USER#${userId}#-IMG`,
          SK: imgId
      },
      UpdateExpression: "set #u = :url",
      ExpressionAttributeNames: {
        '#u': "attachmentUrl"
      },
      ExpressionAttributeValues: {
          ":url": url
      }
    }
    
    const result = await this.docClient.update(params).promise()
    console.log(`Update result: ${JSON.stringify(result)}`)


    return Promise.resolve()
  }

  async setImgTags(imgId: string, tags: any): Promise<ImgItem> {
    console.log(`imgAccess.updateImgTags function!`)
    const queryparams = {
      TableName : this.imagesTable,
      IndexName : this.imagesIdIndex,
      KeyConditionExpression: "#img = :id",
      ExpressionAttributeNames:{
          "#img": "imgId"
      },
      ExpressionAttributeValues: {
          ":id": imgId
      }
    }
    const res = await this.docClient.query(queryparams).promise()

    const item = res.Items as ImgItem[]
    
    const params = {
      TableName: this.imagesTable,
      Key: {
          PK: item[0].PK,
          SK: imgId
      },
      UpdateExpression: "set #t = :tags",
      ExpressionAttributeNames: {
        '#t': "tags"
      },
      ExpressionAttributeValues: {
          ":tags": tags
      },
      ReturnValues: "ALL_NEW"
    }
    
    const result = await this.docClient.update(params).promise()
    console.log('Update Tag result: ' + JSON.stringify(result))


    return result.Attributes as ImgItem
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