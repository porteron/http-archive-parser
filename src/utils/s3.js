require('dotenv').config();
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS,
        secretAccessKey: process.env.AWS_SECRET,
    }
});

async function getS3Object(bucket, objectKey) {
    console.log("Get Object: ", bucket, objectKey)
    try {
        const params = {
            Bucket: bucket,
            Key: objectKey
        }

        const data = await s3.getObject(params).promise();
        return JSON.parse(data.Body.toString('utf-8'))

    } catch (e) {
        throw new Error(`Could not retrieve file from S3: ${e.message}`)
    }
}

async function uploadS3Object(bucket, objectKey, data) {
    console.log("--- Upload S3 Object ---\n", bucket, objectKey)
    try {

        s3.putObject({
            Bucket: bucket,
            Key: objectKey,
            Body: JSON.stringify(data),
            ContentType: "application/json"
        },
            function (err, data) {
                console.log("Complete - Uploaded Data To S3");
            }
        );

    } catch (e) {
        throw new Error(`Could not retrieve file from S3: ${e.message}`)
    }
}


module.exports = { getS3Object, uploadS3Object };
