import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic

const s3bucketName = process.env.ATTACHMENT_S3_BUCKET
//const signedUrlExpiration: number = parseInt(process.env.SIGNED_URL_EXPIRATION)

export class AttachmentUtils {
    constructor(
        private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly bucketName = s3bucketName
    ) { }

    getAttachmentUrl(todoId: string) {
        return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
    }

    UploadUrl(todoId: string): string {
        console.log('getting signedUrl')
        const url = this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: 300
        })
        return url as string
    }
}
