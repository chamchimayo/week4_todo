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