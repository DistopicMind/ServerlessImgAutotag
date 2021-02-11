# Serverless Image Autotag 

Serverless application to get images "autotagged" by AI using AWS Lambda and Serverless framework. 

# Functionality of the application

This application will allow creating/removing/updating/fetching Image items. 
Image tags are created automatically processing each image with AI (AWS Rekognition).
The application will also allow to fetch Image items querying directly by tag name.
Each user only has only access to items that he/she has created.


# Images items

The application return Image items, item contains the following fields:

* `createdAt` string) - date and time when an item was created
* `imgId` (string) - a unique id 
* `name` (string) - a title given by user
* `attachmentUrl` (string) (optional) - an URL pointing to image file uploaded by user
* `tags` (TagItem array) (optional) - tags (setted  asynchronously after imgae upload)

Every TagItem contain 2 fields: 

* `name` (string) - the label detected 
* `confidence` (number) - related label confidence


GetImages result example:

```json
  "items": [
        {
            "createdAt": "2021-02-10T19:52:34.949Z",
            "imgId": "123", 
            "name": "My best pic", 
            "attachmentUrl": "https://imageurl", 
            "tags": [ 
                {
                    "name": "Turtle",
                    "confidence": "98.01"
                },
                {
                    "name": "Sea Life",
                    "confidence": "98.01"
                },
                {
                    "name": "Sea Turtle",
                    "confidence": "96.33"
                },
                {
                    "name": "Water",
                    "confidence": "94.53"
                },
                {
                    "name": "Tortoise",
                    "confidence": "91.19"
                }
            ]
        },
        {
            "createdAt": "2021-02-10T19:52:32.640Z",
            "imgId": "344",
            "name": "My second best pic",
            "attachmentUrl": "https://imageurl",
            "tags": [
                {
                    "name": "Amphiprion",
                    "confidence": "99.56"
                },
                {
                    "name": "Sea Life",
                    "confidence": "99.56"
                },
                {
                    "name": "Animal",
                    "confidence": "99.56"
                },
                {
                    "name": "Fish",
                    "confidence": "99.56"
                },
                {
                    "name": "Sea Anemone",
                    "confidence": "95.42"
                }
            ]
        }
      ]

```


# Autotagging and query by tag
Image processing is handled asynchronously when image is uploaded in AWS S3 bucket:

S3  bucket on 'PutItem' event publishes a message with SNS and lambda function AnalyzeImage (analyzeImg.ts) handle it.
AnalyzeImage calls AWS Rekognition detectLabel method and store results (part of it) as tags array in ImgItem.
AnalyzeImage finally publishes the just update ImgItem with SNS and lambda function CreateTags (createTags.ts) handle it.
CreateTags will create a new record (ImgTagItem) for every tag founded in imgItem.tags .

All ImgTagItem records will be updated on image update or deleted on image deletion .
The number of tags returned is a static variable in serverless.yml: REKOGNITION_MAX_LABELS .

# Backend 
AWS S3 is used to store files
AWS DynamoDb as database
AWS Rekognition is used to detect tags
AWS Lambda + Api gateway as endpoint
SNS Topics, Request validators , Policies etc ... are all declared in serverless.yml 

# Lambda Functions implemented

* `Auth` - Auth0 authorizer , with RS256 asymmetric alg and token verification against auto downloaded certificate from outh0 website. 

* `GetImages` - return all images for a current user. Ordered by createdAt descending


* `GetImage` - receive an imgId and return a single image item 


* `GetImagesByTag` - receive a tag name and return all images that match the given tag name for a current user. Ordered by createdAt descending

* `UpdateImg` - receive an imgId as path param and an object that contain only one field that can be updated in a Img item:

```json
{
  "name": "Picture Updated name" 
}
```

* `DeleteImg` - receive an imgId as path param and delete all resources related to imgId

* `GenerateUploadUrl` - returns a pre-signed URL that can be used to upload an attachment file for a img item

* `AnalyzeImage` - receive S3 event,call Rekognition detectLabel method, update ImgId with results and publish with SNS 

* `CreateTags` - receive ImgItem as SNS message and create tag related records (ImgTagItem)




# Frontend

The `client` folder contains a simple web application but only few features are implemented
You can only authenticate , create image , upload image, delete image and get all images.
Tags are not implemented!

To run your application you need to edit `config.ts` file in the `client` folder. You need to set also apiId and check apiEndpoint




## Authentication

Authentication in the application is provided with Auth0, so to run your application you have to create an Auth0 application and copy "domain" and "client id" to the `config.ts` file in the `client` folder.
You have to update also `jwksUrl` in `Auth0Authorizer.ts`




# How to run the application

## Backend
Before deploying the application create your own Auth0 application and set `jwksUrl` in `Auth0Authorizer.ts`

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless image autotag application.

# Postman collection
You can find a runnable Postman collection in this project to test the API entirely.
You have to change postman collection variables :  apiUrl ,  authToken1 and authToken2 (2 tokens from 2 previously created users) 
Before running the collection put `postman/ImageAutotag-TestImages` folder in your postman 'Working Directory' (you can find it in postman settings) so that automated tests can run


