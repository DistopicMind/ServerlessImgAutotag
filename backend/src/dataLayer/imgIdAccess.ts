import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { ImgItem } from '../models/ImgItem'
import { UpdateImgRequest } from '../requests/UpdateImgRequest'



export class ImgIdAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly imagesTable = process.env.IMAGES_TABLE,
    private readonly imagesIdIndex = process.env.IMAGESID_INDEX
    ) {
  }

  async updateImgIdName(imgId: string, req: UpdateImgRequest): Promise<void> {
    console.log(`imgAccess.updateImgTags function!`)
    
    
    const items = await this.getImgItems(imgId)
    
    const promises = []

    for (var item in items){
        var params = {
            TableName: this.imagesTable,
            Key: {
                PK: items[item].PK,
                SK: imgId
            },
            UpdateExpression: "set #n = :n",
            ExpressionAttributeNames: {
              '#n': "name"
            },
            ExpressionAttributeValues: {
                ":n": req.name
            },
            ReturnValues: "ALL_NEW"
        }
        promises.push(this.docClient.update(params).promise())
    
    }
    
    await Promise.all(promises)
    console.log("createTagsFromImgItem ImageTagItem creation result: " + JSON.stringify(promises))
    
    return Promise.resolve()
  }

  async deleteImgId(imgId: string): Promise<void> {
    console.log('imgAccess.deleteImg function! delete request imgId: '+ imgId)
    const items = await this.getImgItems(imgId)
    
    const promises = []

    for (var item in items){
        var params = {
            TableName: this.imagesTable,
            Key: {
                PK: items[item].PK,
                SK: items[item].SK
            }
        }
        promises.push(this.docClient.delete(params).promise())
    
    }
    
    await Promise.all(promises)
    console.log("delet Image result: " + JSON.stringify(promises))
    
    return Promise.resolve()
    
  }

  async getImgItems(imgId: string): Promise<ImgItem[]> {
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
    return res.Items as ImgItem[]
    
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