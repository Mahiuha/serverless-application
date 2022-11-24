import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
  constructor(
    // CreateDynamoDbClient function was wraping DynamoDB with xry
    // private readonly docClient: DocumentClient = CreateDynamoDbClient(),
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todoTable = process.env.TODOS_TABLE
  ) {}

  async getAllToDo(userId: string): Promise<TodoItem[]> {
    console.log('Getting all todos')

    const params = {
      TableName: this.todoTable,
      KeyConditionExpression: '#userId = :userId',
      ExpressionAttributeNames: {
        '#userId': 'userId'
      },
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }

    const result = await this.docClient.query(params).promise()
    console.log(result)
    const items = result.Items

    return items as TodoItem[]
  }

  async createToDo(todoItem: TodoItem): Promise<TodoItem> {
    console.log('Creating new todo')

    const params = {
      TableName: this.todoTable,
      Item: todoItem
    }

    const result = await this.docClient.put(params).promise()
    logger.info(result)

    return todoItem as TodoItem
  }

  async updateToDo(
    todoUpdate: TodoUpdate,
    todoId: string,
    userId: string
  ): Promise<TodoUpdate> {
    console.log('Updating todo')

    const params = {
      TableName: this.todoTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: 'set #a = :a, #b = :b, #c = :c',
      ExpressionAttributeNames: {
        '#a': 'name',
        '#b': 'dueDate',
        '#c': 'done'
      },
      ExpressionAttributeValues: {
        ':a': todoUpdate['name'],
        ':b': todoUpdate['dueDate'],
        ':c': todoUpdate['done']
      },
      ReturnValues: 'ALL_NEW'
    }

    const result = await this.docClient.update(params).promise()
    logger.info(result)
    const attributes = result.Attributes

    return attributes as TodoUpdate
  }

  async deleteToDo(todoId: string, userId: string): Promise<string> {
    console.log('Deleting todo')

    const params = {
      TableName: this.todoTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    }

    const result = await this.docClient.delete(params).promise()
    logger.info(result)
    return 'Todo Deleted' as string
  }
}

// This function was intended to wrap XAWS to DynamoDB
// function CreateDynamoDbClient() {
//   return new XAWS.DynamoDB.DocumentClient()
// }
