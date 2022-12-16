import * as AWS from 'aws-sdk'
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
        private readonly todoTable: string = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.INDEX_NAME
    ) { }

    async getTodosForUser(userId: string): Promise<TodoItem[]> {

        logger.info('Get all user todos', `UserId ${userId}`)

        const result = await this.docClient
        .query({
            TableName: this.todoTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const todos = result.Items
        logger.info('Get all todos result', `UserId ${userId}`, result.Items,)

        return todos as TodoItem[];
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        
        logger.info("Creating todo items for user", todoItem)

        await this.docClient
        .put({
            TableName: this.todoTable,
            Item: todoItem
        }).promise()

        logger.info("Todo item created successfully", todoItem)

        return todoItem;
    }

    async updateTodo(
        todoUpdate: TodoUpdate, 
        userId: string, 
        todoId: string
        ) {

            logger.info('Updating todo items', todoUpdate, `todoId: ${todoId}`)

        const result = await this.docClient.get({
            TableName: this.todoTable,
            Key: {
                userId: userId,
                todoId: todoId
            },

        }).promise()


        if (!result.Item) {
            throw Error('unable to find Item')
        }

        await this.docClient.update({
            TableName: this.todoTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'SET done = :done, #name = :name, dueDate = :dueDate',
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ExpressionAttributeValues: {
                ':done': todoUpdate.done,
                ':name': todoUpdate.name,
                ':dueDate': todoUpdate.dueDate
            }
        }).promise()

        logger.info("Todo item updated successfully", todoUpdate, `todoId: ${todoId}`)

    }

    async deleteTodo(userId: string, todoId: string) {

        logger.info("Deleting a todo item", `todoId: ${todoId}`)

        const result = await this.docClient.get({
            TableName: this.todoTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        }).promise()

        if (!result.Item) {
            throw Error('unable to find item')
        }

        this.docClient.delete({
            TableName: this.todoTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        }).promise()

        logger.info("Todo item deleted successfully", `todoId: ${todoId}`)

    }


}