import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify} from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-vico.us.auth0.com/.well-known/jwks.json';


export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {

  logger.info('Authorizing a user', event.authorizationToken)
  const todayDate = new Date().toISOString().slice(0, 10);

  try {

    const jwtToken = await verifyToken(event.authorizationToken)

    logger.info('User is authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: todayDate,
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {

    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: todayDate,
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  try {

    const token = getToken(authHeader)
    const res = await Axios.get(jwksUrl);

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
    const pemData = res['data']['keys'][0]['x5c'][0]
    const cert = `-----BEGIN CERTIFICATE-----\n${pemData}\n-----END CERTIFICATE-----`

    return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
  } catch(err){
    logger.error('authentication failed!', err)
  }
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('token is missing!')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid Bearer Token supplied')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

