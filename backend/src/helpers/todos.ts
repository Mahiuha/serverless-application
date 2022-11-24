import { TodosAccess } from './todosAcess'
import { getUploadUrl } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
// import * as uuid from 'uuid'
// import * as createError from 'http-errors'
import { TodoUpdate } from '../models/TodoUpdate'

// TODO: Implement businessLogic

const uuidv4 = require('uuid/v4')
const toDoAccess = new TodosAccess()

export async function getAllToDo(userid: string): Promise<TodoItem[]> {
  const userId = userid
  return toDoAccess.getAllToDo(userId)
}

export function createToDo(
  createTodoRequest: CreateTodoRequest,
  userid: string
): Promise<TodoItem> {
  const userId = userid
  const todoId = uuidv4()
  const s3BucketName = process.env.ATTACHMENT_S3_BUCKET

  return toDoAccess.createToDo({
    userId: userId,
    todoId: todoId,
    attachmentUrl: `https://${s3BucketName}.s3.amazonaws.com/${todoId}`,
    createdAt: new Date().getTime().toString(),
    done: false,
    ...createTodoRequest
  })
}

export function updateToDo(
  updateTodoRequest: UpdateTodoRequest,
  todoId: string,
  userid: string
): Promise<TodoUpdate> {
  const userId = userid
  return toDoAccess.updateToDo(updateTodoRequest, todoId, userId)
}

export function deleteToDo(todoId: string, userid: string): Promise<string> {
  const userId = userid
  return toDoAccess.deleteToDo(todoId, userId)
}

export function createAttachmentPresignedUrl(todoId: string): Promise<string> {
  return getUploadUrl(todoId)
}
