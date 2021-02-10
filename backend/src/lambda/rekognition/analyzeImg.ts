import { SNSEvent, SNSHandler, S3EventRecord } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { ImgItemAccess } from '../../dataLayer/imgItemAccess'



const XAWS = AWSXRay.captureAWS(AWS)
const clientRekognition = new XAWS.Rekognition();
const sns = new XAWS.SNS()
const imgItemAccess = new ImgItemAccess();
const topicArn = process.env.TAG_CREATION_TOPIC_ARN
const maxLabels = process.env.REKOGNITION_MAX_LABELS

//Catch SNS event on S3 image upload and analyze with AWS Rekognition
//The labels detected will be stored as tags
// A new SNS event will be published with the imgItem just analyzed to allow tag management

export const handler: SNSHandler = async (event: SNSEvent) => {
  console.log('Processing SNS event ', JSON.stringify(event))
  for (const snsRecord of event.Records) {
    const s3EventStr = snsRecord.Sns.Message
    console.log('Processing S3 event', s3EventStr)
    const s3Event = JSON.parse(s3EventStr)

    for (const record of s3Event.Records) {
      await analyzeImage(record)
    }
  }
  
}

async function analyzeImage(record: S3EventRecord) : Promise<void> {
  const key = record.s3.object.key
  const bucket = record.s3.bucket.name
  console.log('Processing with Rekognition S3 image with key: ', key)
  // Analyzing with aws rekognition (detecLabels)
  const params = {
    Image: {
      S3Object: {
        Bucket: bucket,
        Name: key
      },
    },
    MaxLabels: parseInt(maxLabels)
  }
  const response = await clientRekognition.detectLabels(params).promise()

  // Extracting labels into tags
  const tags = []
  for (const label of response.Labels) {
    console.log(`Label: ${label.Name} Confidence: ${label.Confidence}`)
    tags.push({name: label.Name, confidence: label.Confidence.toFixed(2)}) 
    
  }

  console.log(`ImageId ${key} Processed with Rekognition, tags found: ${JSON.stringify(tags)}`)

  //Store tags in DB 
  const ret = await imgItemAccess.setImgTags(key,tags) 


  //Publishing with SNS the updated ImgItem record for later use in creating tags records

  console.log(`ImageId ${key} record updated: ${JSON.stringify(ret)}`)
  
  console.log(`Topic ARN: ${topicArn}`)
  
  const parm = {
    Message: JSON.stringify({
      default: JSON.stringify( ret )
    }),
    MessageStructure: 'json',
    TopicArn: topicArn
    
  }
  await sns.publish(parm).promise()

  return Promise.resolve()
  
}


