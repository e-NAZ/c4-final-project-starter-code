import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
// import { loggers } from "winston";
import { Types } from 'aws-sdk/clients/s3';
import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";

export class ToDoAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todoTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.INDEX_NAME,
        private readonly s3Client: Types = new AWS.S3({ signatureVersion: 'v4' }),
        private readonly s3BucketName = process.env.ATTACHMENT_S3_BUCKET) {
    }

    async getAllToDo(userId: string): Promise<TodoItem[]> {

        const output = await this.docClient
        .query({
            TableName: this.todoTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ":userId": userId
            }
        })
        .promise()

        const items = output.Items;
        return items as TodoItem[];
    }

    async createToDo(todoItem: TodoItem): Promise<TodoItem> {

        const params = {
            TableName: this.todoTable,
            Item: todoItem,
        };

        const result = await this.docClient.put(params).promise();
        console.log(result);
        return todoItem as TodoItem;
    }

    async updateToDo(todoUpdate: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {

        const params = {
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set #x = :x, #y = :y, #z = :z",
            ExpressionAttributeNames: { "#x": "name", "#y": "dueDate", "#z": "done"},
            ExpressionAttributeValues: {
                ":x": todoUpdate['name'],
                ":y": todoUpdate['dueDate'],
                ":z": todoUpdate['done']
            },
            ReturnValues: "ALL_NEW"
        };

        const result = await this.docClient.update(params).promise();
        const attributes = result.Attributes;
        console.log(result);
        return attributes as TodoUpdate;
    }

    async deleteToDo(todoId: string, userId: string): Promise<string> {
        const params = {
            TableName: this.todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
        };

        const result = await this.docClient.delete(params).promise();
        console.log(result);

        return "" as string;
    }

    async generateUploadUrl(todoId: string): Promise<string> {
      const URL = this.s3Client.getSignedUrl('putObject', {
            Bucket: this.s3BucketName,
            Key: todoId,
            Expires: 300,
        });
        console.log(URL);

        return URL as string;
    }
}



