import 'source-map-support/register'
import {APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler} from 'aws-lambda';
import {getAllToDo} from "../../businessLogic/ToDos";
import { getUserId } from '../utils';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Get all TODO items for a current user
    // console.log("Processing Event ", event);
    const authorization = event.headers.Authorization;
    // console.log(authorization, "auth");
    const split = authorization.split(' ');
    const jwtToken = split[1];
    console.log(jwtToken, "token");
    

    const userId = getUserId(event)
    const toDos = await getAllToDo(userId)
    

    return {
        
        headers: {
            'Access-Control-Allow-Origin': "*",
            'Access-Control-Allow-Credentials': true
        },
        statusCode: 200,
        body: JSON.stringify({
            items: toDos
        }),
        
    }
};

