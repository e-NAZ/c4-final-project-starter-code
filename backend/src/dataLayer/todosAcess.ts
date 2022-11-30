import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.INDEX_NAME


    ) { }

    async getAllUserTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Get a list of all todos')

        const result = await this.docClient
            .query({
                TableName: this.todosTable,
                IndexName: this.todosIndex,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                }
            })
            .promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async createTodoItem(TodoItem: TodoItem): Promise<TodoItem> {
        logger.info('Creating todo ietms for user')
        await this.docClient
            .put({
                TableName: this.todosTable,
                Item: TodoItem
            })
            .promise()
        return TodoItem
    }

    async updateTodoItem(
        todoId: string,
        userId: string,
        TodoUpdate: TodoUpdate
    ): Promise<TodoUpdate> {
        logger.info('updating todo items')

        const result = await this.docClient
            .update({
                TableName: this.todosTable,
                Key: { todoId, userId },
                UpdateExpression: 'SET #nombre = :name, fecha = :dueDate, hecho = :done',
                ExpressionAttributeValues: {
                    ':nombre': TodoUpdate.name,
                    ':fecha': TodoUpdate.dueDate,
                    ':hecho': TodoUpdate.done
                },
                ExpressionAttributeNames: {
                    '#nombre': 'name',
                    '#fecha': 'dueDate',
                    '#hecho': 'done'
                }


            })
            .promise()
            const todoItemUpdate = result.Attributes
            logger.info('todo item updated', todoItemUpdate)
            return todoItemUpdate as TodoUpdate
        
    }

    async deleteTodoItem(todoId: string, userId: string): Promise<string> {
        logger.info('Deleting todo item')

        const result = await this.docClient
            .delete({
                TableName: this.todosTable,
                Key: { todoId, userId }
            })
            .promise()


        logger.info('todo item deleted', result)
        return todoId as string

    }


    async updateTodoAttachmentUrl(
        todoId: string,
        userId: string,
        attachmentUrl: string
    ): Promise<void> {
        logger.info('updating todo attachment url')
        await this.docClient
            .update({
                TableName: this.todosTable,
                Key: { todoId, userId },
                UpdateExpression: 'SET attachmentUrl = :attachmentUrl',
                ExpressionAttributeValues: {
                    ':attachmentUrl': attachmentUrl
                }

            })
            .promise()
    }

}