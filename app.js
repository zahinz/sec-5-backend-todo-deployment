import express from "express";
import dbInit from "./database/dbInit.js";
import { checkHealth } from "./controller/health.js";
import { login, register } from "./controller/auth.js";
import todoController from "./controller/todo.js";
import isAuth from "./middleware/isAuth.js";
import cors from "cors"

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const app = express();
const PORT = 3000;

// middleware for req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

// initialize database
dbInit();

// routes
app.get("/", checkHealth);
app.post("/register", register);
app.post("/login", login);
app.post("/todo", isAuth, todoController.create);
app.get("/todo", isAuth, todoController.list);
app.put("/todo/:id", isAuth, todoController.update);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
