const http = require("http");
const fs = require("fs");

const port = 4000;

  function readTodo() {
    fs.readFile("todos.json", "utf-8", (err, data) => {
      if (err) 
      throw err;
      const json = data;
      const parsedData = JSON.parse(json);
      todos = parsedData;
    });
  }
  function writeFile(todos) {
    fs.writeFile("todos.json", JSON.stringify(todos), "utf-8", (err, data) => {
      if (err) throw err;
    });
  }
  
  readTodo();

  const app = http.createServer((req, res) => {
  
    res.setHeader("Access-Control-Allow-Origin", "*");  
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
    );
  res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, PATCH, DELETE, OPTIONS, POST, PUT"
    );
    if (req.method === "OPTIONS") {
      res.statusCode = 200;
      res.end();
    }   
 
const list = req.url.split("/");

console.log(list);    


//Hämtar alla tasks
if (req.method === "GET" && list[1] === "todos" && list.length === 2) {
res.statusCode = 200;  
res.setHeader("Content-Type", "application/json")
res.end(JSON.stringify(todos)) 
}
//Hämtar en enskild task
else if (req.method === "GET" && list[1] === "todos") {
const requestedId = parseInt(list[2]);
const requestedTask = todos.find((todo) => todo.id === requestedId);
//Om den tasken hittas - statuskod 200
if (requestedTask) {
res.statusCode = 200;  
res.setHeader("Content-Type","application/json");
res.end(JSON.stringify(requestedTask)) ; 
}
else {
//tasken hittades inte - statuskod 404
res.statusCode = 404;  
res.end();
}
}

// fetch("http://localhost:4000/todos", { method: "POST", body: JSON.stringify({"id": 1234, "task": "Go out for a walk", "complete": false }), headers: {"Content-Type": "application/json"}})
else if (req.method === "POST" && list[1] === "todos" && list.length === 2) {
//Lägger till en ny todo
  res.statusCode = 200;
  req.on("data", (chunk) => {
    const data = JSON.parse(chunk);
    console.log("ny todo!");
    todos.push({
      id: +(new Date().getTime().toString() + Math.floor(Math.random()*1000000)),
      ...data,
      complete: false
    });
    writeFile(todos, null, "\t")
    res.end();
  });}
  //Tar bort todos - DELETE todos/id
  else if (req.method === "DELETE" && list[1] === "todos" && list.length === 3) {
    const requestedId = parseInt(list[2]);
     todos = todos.filter(todos => todos.id !== requestedId);
     console.log("delete");
   
     res.statusCode = 200;
      
     writeFile(todos, null, "\t");
     res.end();
   }
  //fetch("http://localhost:4000/todos/2", { method: "PUT", body: JSON.stringify({"id": 143226435, "task": "Paint", "complete": false}), headers: {"Content-Type": "application/json"}})
  else if (req.method === "PUT" && list[1] === "todos" && list.length === 3) {
    // PUT todos/id - Ersätter hela resursen
    const requestedId = parseInt(list[2]);
    const todoIndex = todos.findIndex((todos) => todos.id === requestedId);

    req.on("data", (chunk) => {
      todos[todoIndex] = JSON.parse(chunk);
    
    res.statusCode = 200;
    res.end();
    writeFile(todos, null, "\t");
    });
  }
  //fetch("http://localhost:4000/todos/1", { method: "PATCH", body: JSON.stringify({"task": "Do jumping jacks" }), headers: {"Content-Type": "application/json"}})
 else if (req.method === "PATCH" && list[1] === "todos" && list.length === 3) {
  // PATCH todo/id - Ersätter delvis resursen - task
  const requestedId = parseInt(list[2]);
  const todoIndex = todos.findIndex((todos) => todos.id === requestedId)

  req.on("data", (chunk) => {
  const data = JSON.parse(chunk);
  let taskIndex = todos[todoIndex];

  if (data.task) {
    taskIndex.task = data.task;
  } else if (data.complete) {
    taskIndex.complete = data.complete;
  } else if (!data.complete) {
    taskIndex.complete = data.complete; 
  } else {
    res.statusCode = 400;
   
  }
});
}
res.statusCode = 200;
res.end();

});



app.listen(4000, () => {

console.log(`Servern kör på ${port}`);
})