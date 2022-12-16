import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';

import { updateTodo } from '../../businessLogic/todos';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger';

const logger = createLogger('updateTodo');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Updating todo item', `token: ${event.headers.authorizationToken}`, event.body);
  const userId = getUserId(event);
  const todoId = event.pathParameters.todoId;
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);

  try {
    await updateTodo(updatedTodo, userId, todoId);
    return {
      statusCode: 200,
      body: JSON.stringify({}),
    };
  } catch (e) {
    logger.error('Todo item failed to update', e.message);
    return {
      statusCode: 404,
      body: JSON.stringify({
        'error message': e.message,
      }),
    };
  }
});

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
    }),
  );
