const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Todo = require("./models/todo");

mongoose.connect("mongodb://localhost/todo-demo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

const app = express();
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hi!");
});

// 할 일 순서 변경하는 API
router.patch("/todos/:todoId", async (req, res) => {
    const { todoId } = req.params;
    const { order, value, done } = req.body;

    const todo = await Todo.findById(todoId).exec();

    if (order) {
        const targetTodo = await Todo.findOne({ order }).exec();
        if (targetTodo) {
            targetTodo.order = todo.order;
            await targetTodo.save();
        }
        todo.order = order;
    } else if (value) {
        todo.value = value;
    } else if (done !== undefined) {
        todo.doneAt = done ? new Date() : null;
    }
    await todo.save();

    res.send({});
});

// 할 일 삭제 API
router.delete("/todos/:todoId", async (req, res) => {
    const { todoId } = req.params;
    
    try {
        await Todo.findOneAndDelete(todoId);
        
        res.json({ "message": "할 일이 삭제되었습니다." });
    } catch(error) {
    } 
});

// 할 일 목록 가져오기 API
router.get("/todos", async (req, res) => {
    try {
        const todos = await Todo.find().sort("-order").exec();
        
        res.send({ todos });
    } catch(e) {
    }
});

// 할 일 추가 API
router.post("/todos", async (req, res) => {
    const { value } = req.body;
    const maxOrderTodo = await Todo.findOne().sort("-order").exec();
    let order = 1;

    if(maxOrderTodo) {
        order = maxOrderTodo.order + 1;
    }

    const todo = new Todo({ value, order });
    await todo.save();

    res.send({ todo });
});

app.use("/api", bodyParser.json(), router);
app.use(express.static("./assets"));

app.listen(8080, () => {
  console.log("서버가 켜졌어요!");
});