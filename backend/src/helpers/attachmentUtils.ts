import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createLogger } from '../utils/logger';

const AWSXRay = require('aws-xray-sdk');

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('AttachmentUtils');

export class AttachmentUtils {
  private readonly bucketName: string;
  private readonly s3: AWS.S3;
  private readonly uploadUrlExpiration: number;
  private readonly docClient: DocumentClient;
  private readonly todoTable: string;

  constructor(
    bucketName: string = process.env.ATTACHMENT_S3_BUCKET,
    s3 = new XAWS.S3({
      signatureVersion: 'v4',
    }),
    uploadUrlExpiration: number = parseInt(process.env.SIGNED_URL_EXPIRATION),
    docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    todoTable: string = process.env.TODOS_TABLE,
  ) {
    this.bucketName = bucketName;
    this.s3 = s3;
    this.uploadUrlExpiration = uploadUrlExpiration;
    this.docClient = docClient;
    this.todoTable = todoTable;
  }

  async createAttachmentPresignedUrl(todoId: string, userId: string): Promise<string> {
    logger.info('Creating a signed url', todoId);

    const result = await this.docClient.get({
      TableName: this.todoTable,
      Key: {
        userId,
        todoId,
      },
    }).promise();

    if (!result.Item) {
      throw Error('Unable to find item');
    }

    const signedUrl = this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: this.uploadUrlExpiration,
    });
    logger.info('Signed URL created successfully', `url: ${signedUrl}`, todoId);

    await this.docClient.update({
      TableName: this.todoTable,
      Key: {
        userId,
        todoId,
      },
      UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': `https://${this.bucketName}.s3.amazonaws.com/${todoId}`,
      },
    }).promise();

    logger.info('Signed attachment url is updated', `url: ${signedUrl}`, todoId);

    return signedUrl;
  }
}
