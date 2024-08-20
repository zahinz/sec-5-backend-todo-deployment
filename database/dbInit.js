import { createTodoTable, createUserTable } from "../model/index.js";
import { checkConnection } from "./connection.js";

async function dbInit() {
  await checkConnection();
  await createUserTable();
  await createTodoTable();
}

export default dbInit;
