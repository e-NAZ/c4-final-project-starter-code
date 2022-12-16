import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

const logger = createLogger('Todos')
const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()


export function getTodosForUser(userId: string): Promise<TodoItem[]> { 
    logger.info('Fetching all user todos', userId)
    return todosAccess.getTodosForUser(userId)
 }

export function createTodo(request: CreateTodoRequest, userId: string): Promise<TodoItem> {
    const createdAt = new Date().toISOString()
    const todoItemId = uuid.v4()
    logger.info('Creating a todo item', {request, userId})

    const newItem = {
        todoId: todoItemId,
        name: request.name,
        createdAt: createdAt,
        dueDate: request.dueDate,
        done: false,
        userId: userId,
    }
        return todosAccess.createTodo(newItem)
}

export function updateTodo(request: UpdateTodoRequest, userId: string, todoId: string) {

    logger.info('Updating a todo item', {request, userId, todoId})
    return todosAccess.updateTodo(request, userId, todoId)
}

export async function deleteTodo(userId: string, todoId: string) {
    logger.info('Deleting a todo item', {userId, todoId})
    await todosAccess.deleteTodo(userId, todoId)
}

export async function createAttachmentPresignedUrl(todoId: string, userId: string): Promise<string> {
    logger.info('Creating a signed URL', {userId,todoId})
    return attachmentUtils.createAttachmentPresignedUrl(todoId, userId)
}