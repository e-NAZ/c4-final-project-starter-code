import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';

import { createAttachmentPresignedUrl } from '../../businessLogic/todos';
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger';

const logger = createLogger('generateUploadUrl');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  const userId = getUserId(event);
  logger.info('Generating a signed url', `token: ${event.headers.authorizationToken}`, event.pathParameters.todoId);

  

  try {
    const url = await createAttachmentPresignedUrl(todoId, userId);
    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: url,
      }),
    };
  } catch (e) {
    logger.error('PreSigned URL failed to generate', e.message);
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
