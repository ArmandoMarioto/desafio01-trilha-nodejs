const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user){
    return response.status(404).json({error: "User not found"});
  }

  request.user = user;
  return next();

}


const users = [];
// { 
// 	id: 'uuid', // precisa ser um uuid
// 	name: 'Danilo Vieira', 
// 	username: 'danilo', 
// 	todos: []
// }

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.some((user) => user.username === username);

  if(userAlreadyExists){
    return response.status(400).json({error: "User already exists!"});
  }
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };
  users.push(newUser)

  return response.status(201).send(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);

});

// todos
// { 
// 	id: 'uuid', // precisa ser um uuid
// 	title: 'Nome da tarefa',
// 	done: false, 
// 	deadline: '2021-02-27T00:00:00.000Z', 
// 	created_at: '2021-02-22T00:00:00.000Z'
// }

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request

  const todoOperation = {
    id: uuidv4(),
    title,
    done:false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todoOperation);
  
  return response.status(201).send(todoOperation);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((todo => todo.id == id));

  if(todoIndex === -1 ){
    return response.status(404).json({error: "Todo not found!"})
  }

  user.todos[todoIndex].title = title;
  user.todos[todoIndex].deadline = new Date(deadline);

  return response.status(200).send(user.todos[todoIndex]);
  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((todo => todo.id == id));

  if(todoIndex === -1 ){
    return response.status(404).json({error: "Todo not found!"})
  }

  user.todos[todoIndex].done = true;

  return response.status(200).send(user.todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((todo => todo.id == id));

  if(todoIndex === -1 ){
    return response.status(404).json({error: "Todo not found!"})
  }

  user.todos.pop(todoIndex);
  
  return response.status(204).send();
});

module.exports = app;