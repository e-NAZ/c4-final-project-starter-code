import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { TodoUpdate } from '../models/TodoUpdate';
//import { TodoUpdate } from '../models/TodoUpdate';
//import * as createError from 'http-errors'

// TODO: Implement businessLogic

const logger = createLogger('TodoAccess')
const attachmentUtils = new AttachmentUtils()
const todosAcess = new TodosAccess()


// get todo items

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info('fetch all user todos')
    return todosAcess.getAllUserTodos(userId)
}

// creating todo item
export async function createTodo(
    newTodo: CreateTodoRequest,
    userId: string
): Promise<TodoItem> {
    logger.info('Creating a todo item')
    const todoId = uuid.v4()
    const AttachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
    const createdAt = new Date().toISOString()
    const newItem = {
        userId,
        todoId,
        createdAt,
        done: false,
        attachmentUrl: AttachmentUrl,
        ...newTodo
    }

    return await todosAcess.createTodoItem(newItem)
}

// update todo item

export async function updateTodo(TodoUpdate: UpdateTodoRequest, userId: string, todoId: string):
    Promise<TodoUpdate> {
    logger.info('updating todo items..')
    return await todosAcess.updateTodoItem(todoId, userId, TodoUpdate)
}

// delete todo item
export async function deleteTodo(
    todoId: string,
    userId: string
): Promise<string> {
    logger.info(' deleting todo items')
    return todosAcess.deleteTodoItem(todoId, userId)
}

//create a presignedurl 
export async function createAttachmentPresignedUrl(
    todoId: string,
    userId: string
): Promise<string> {
    logger.info('creating attahcment pre-signed URL', todoId, userId)
    return attachmentUtils.UploadUrl(todoId)
}