import 'source-map-support/register'
import {APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler} from 'aws-lambda';
import {getAllToDo} from "../../businessLogic/ToDos";

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Get all TODO items for a current user
    console.log("Processing Event ", event);
    const authorization = event.headers.Authorization;
    console.log(authorization, "auth");
    const split = authorization.split(' ');
    const jwtToken = split[1];
    console.log(jwtToken, "token");



    const toDos = await getAllToDo(jwtToken);

    return {
        
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
            "items": toDos,
        }),
        statusCode: 200,
    }
};