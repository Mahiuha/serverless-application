import * as uuid from 'uuid';
import {TodoItem} from "../models/TodoItem";
import {TodoItemAccess} from "../dataLayer/todoItemAccess";
import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {TodoUpdate} from "../models/TodoUpdate";

const todoItemAccess = new TodoItemAccess();

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
    return todoItemAccess.getAllTodoItem(userId);
}

export async function createTodo(
    createGroupRequest: CreateTodoRequest,
    userId: string
): Promise<TodoItem> {

    const todoId = uuid.v4();
    return await todoItemAccess.createTodoItem({
        todoId: todoId,
        userId: userId,
        name: createGroupRequest.name,
        createdAt: new Date().toISOString(),
        dueDate: createGroupRequest.dueDate,
        done: false,
        attachmentUrl: null
    })
}

export async function updateTodo(todoId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
    return await todoItemAccess.updateTodoItem(todoId, todoUpdate);
}

export async function deleteTodoItem(todoId: string) {
    return await todoItemAccess.deleteTodoItem(todoId)
}

export async function uploadAttachment(todoId: string) {
    const imageId = uuid.v4();
    return await todoItemAccess.s3FileUpload(todoId, imageId)
}