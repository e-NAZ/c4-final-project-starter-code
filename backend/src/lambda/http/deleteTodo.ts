import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';

import { deleteTodo } from '../../businessLogic/todos';
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger';

const logger = createLogger('deleteTodo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);
    logger.info('Deleting todo item', `token: ${event.headers.authorizationToken}`, event.pathParameters.todoId);

    try {
      await deleteTodo(userId, todoId);
      return {
        statusCode: 200,
        body: JSON.stringify(''),
      };
    } catch (e) {
      logger.error('Todo item failed to delete', e.message);
      return {
        statusCode: 404,
        body: JSON.stringify({
          'error message': e.message,
        }),
      };
    }
  },
);

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
    }),
  );
