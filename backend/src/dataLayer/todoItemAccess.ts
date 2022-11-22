import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import {DocumentClient} from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import {TodoItem} from "../models/TodoItem";
import {TodoUpdate} from "../models/TodoUpdate";


export class TodoItemAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todoTable = process.env.TODO_TABLE) {
    }

    async deleteTodoItem(todoId: string) {
        console.log("Delete Item with ID: ", todoId)
        await this.docClient.delete({
            TableName: this.todoTable,
            Key: {
                todoId: todoId
            }
        }).promise();
    }

    async getAllTodoItem(userId: string): Promise<TodoItem[]> {
        console.log('Getting all Todos')

        const result = await this.docClient.query({
            TableName: this.todoTable,
            IndexName: "UserIdIndex",
            KeyConditionExpression: ' userId= :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false
        }).promise()

        const items = result.Items
        console.log('Retrieved Item:', items)

        return items as TodoItem[]
    }

    async updateTodoItem(todoId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
        console.log('Updating Todo using ID: ', todoId)

        const todoItem=await this.docClient.update({
            TableName: this.todoTable,
            Key: {"todoId": todoId},
            UpdateExpression: "set #n = :a, dueDate = :b, done = :c",
            ExpressionAttributeValues: {
                ":a": todoUpdate.name,
                ":b": todoUpdate.dueDate,
                ":c": todoUpdate.done
            },
            ExpressionAttributeNames: {
                "#n": "name",
            },
            ReturnValues: "UPDATED_NEW"
        }).promise();
        console.log('Updating Todo using ID: ', todoId)
        return todoItem as TodoUpdate;
    }

    async createTodoItem(todo: TodoItem): Promise<TodoItem> {
        console.log('Create Todo using Data: ', todo)
        await this.docClient.put({
            TableName: this.todoTable,
            Item: todo
        }).promise()

        return todo
    }

    async s3FileUpload(todoId: string, imageId: string) {
        console.log('S3 upload')
        const bucket = process.env.S3_BUCKET
        const url_exp = process.env.SIGNED_URL_EXPIRATION

        const s3 = new AWS.S3({
            signatureVersion: 'v4'
        });

        const url = s3.getSignedUrl('putObject', {
            Bucket: bucket,
            Key: imageId,
            Expires: url_exp
        });
        console.log('Signed URL: ', url)
        const imageUrl = `https://${bucket}.s3.amazonaws.com/${imageId}`;
        await this.docClient.update({
            TableName: this.todoTable,
            Key: {todoId: todoId},
            UpdateExpression: "set attachmentUrl = :a",
            ExpressionAttributeValues: {
                ":a": imageUrl
            },
            ReturnValues: "UPDATED_NEW"
        }).promise();

        return {
            imageUrl: imageUrl,
            uploadUrl: url
        }


    }

}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        console.log('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}


