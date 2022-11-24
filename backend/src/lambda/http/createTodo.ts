import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { createToDo } from '../../helpers/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item  const userId = getUserId(event)
    const userId = getUserId(event)
    const toDoList = await createToDo(newTodo, userId)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: toDoList
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
