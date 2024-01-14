const express = require('express');
const bodyParser = require('body-parser'); 
const session = require('express-session');
const route = require('./routes/route');


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const port = 3000;

app.set('view engine', 'ejs');
app.set('views', './views/pages');

app.use(session({
  secret: '123',
  resave: true,
  saveUninitialized: true
}));

app.use('/', route);
app.use('/login', route);
app.use('/singup', route);
app.use('/logout', route);
app.use('/create-post', route);


app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
