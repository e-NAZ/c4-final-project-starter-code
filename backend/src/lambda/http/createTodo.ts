import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos';
import { createLogger } from '../../utils/logger';

const logger = createLogger('createTodo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const userId = getUserId(event);
      const newTodo: CreateTodoRequest = JSON.parse(event.body);
      logger.info('Creating a todo item', `token: ${event.headers.authorizationToken}`, event.body);

      const todoItem = await createTodo(newTodo, userId);

      return {
        statusCode: 201,
        body: JSON.stringify({
          item: todoItem,
        }),
      };
    } catch (e) {
      logger.error('Todo item not created', e.message);
      return {
        statusCode: 401,
        body: JSON.stringify({
          'error message': e.message,
        }),
      };
    }
  }
);

handler.use(
  cors({
    credentials: true,
  })
);
