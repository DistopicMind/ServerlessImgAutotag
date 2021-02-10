import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import 'source-map-support/register'

//Access to file storage (S3)

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

export async function createSignedUrl(imgId: string){
    const url = await s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: imgId,
      Expires: parseInt(urlExpiration)
    })
    
    return url
}

export async function getPublicUrl(imgId: string){
    return `https://${bucketName}.s3.amazonaws.com/${imgId}`
}

export async function deleteImageFile(imgId: string){
  const res = await s3.deleteObject({ Bucket: bucketName, Key: imgId }).promise()
  return res
}

