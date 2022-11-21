import {TodoItem} from "../models/TodoItem";
import {parseUserId} from "../auth/utils";
//import * as uuid from 'uuid'
import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import {TodoUpdate} from "../models/TodoUpdate";
import {ToDoAccess} from "../dataLayer/todosAccess";
import { createLogger } from "../utils/logger";

const logger = createLogger ('toDoAccess')

//const attachmentutils = new AttachmentUtils()
const todoID = require('uuid/v4');
const toDoAccess = new ToDoAccess();

// get todo fn
export async function getAllToDo(jwtToken: string): Promise<TodoItem[]>  {
    logger.info('Get todo items for user')
    const userId = parseUserId(jwtToken);
    return toDoAccess.getAllToDo(userId);
}

// create todo fn
export const createToDo = (createTodoRequest: CreateTodoRequest, jwtToken: string): Promise<TodoItem> => {
    const userId = parseUserId(jwtToken);
    const todoId =  todoID();
    const s3Bucket = process.env.ATTACHMENT_S3_BUCKET;
    const curr_date = new Date();
    const time = curr_date.getTime();
    const date_string = time.toString();

    const todo_create = toDoAccess.createToDo({
        userId,
        todoId,
        attachmentUrl:  `https://${s3Bucket}.s3.amazonaws.com/${todoId}`, 
        createdAt: date_string,
        done: false,
        ...createTodoRequest,
    });
    
    return todo_create;
}

// update Todo
 export const updateToDo = (updateTodoRequest: UpdateTodoRequest, todoId: string, jwtToken: string): Promise<TodoUpdate>  => {
    const userId = parseUserId(jwtToken);
    return toDoAccess.updateToDo(updateTodoRequest, todoId, userId);
}

 // delete Todo
export const deleteToDo = (todoId: string, jwtToken: string): Promise<string> => {
    const userId = parseUserId(jwtToken);
    return toDoAccess.deleteToDo(todoId, userId);
}

// generate upload URL
 export const generateUploadUrl = (todoId: string): Promise<string>  => {
    return toDoAccess.generateUploadUrl(todoId);
}
