import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
//import { createLogger } from '../../utils/logger'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    //const logger = createLogger('updating todos')

    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object


      const todoItem = await updateTodo(updatedTodo, todoId, userId)
      return {
        statusCode: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          "item": todoItem
        })
      }
    }
)
handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
