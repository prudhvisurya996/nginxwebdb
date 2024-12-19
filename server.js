const express = require('express');  
const app = express();  
const cookieParser = require('cookie-parser');  
const session = require('express-session');  
const mysql = require('mysql');  
const path = require('path'); // For handling file paths

const db = mysql.createConnection({  
  host: '',  
  user: '',  
  password: '',  
  database: 'users'  
});  

db.connect((err) => {  
  if (err) {  
   console.error('error connecting:', err);  
   return;  
  }  
  console.log('connected as id ' + db.threadId);  
});  

app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  
app.use(cookieParser());  
app.use(session({  
  secret: 'mysecretkey',  
  resave: false,  
  saveUninitialized: true,  
  cookie: { secure: false }  
}));

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Serve the register.html file
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '/register.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '/login.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});


// Serve the homepage.html file
app.get('/homepage', (req, res) => {
  res.sendFile(path.join(__dirname, '/homepage.html'));
});

// Registration endpoint
app.post('/register', (req, res) => {  
  const { username, email, password } = req.body;  
  const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;  
  db.query(query, [username, email, password], (err, results) => {  
   if (err) {  
    res.status(400).send({ success: false, message: 'Registration failed!' });  
   } else {  
    res.send({ success: true, message: 'Registration successful! Redirecting to login...', redirect: '/login'  });
   }  
  });  
});  

// Login endpoint
app.post('/login', (req, res) => {  
  const { username, password } = req.body;  
  const query = `SELECT * FROM users WHERE username = ? AND password = ?`;  
  db.query(query, [username, password], (err, results) => {  
  if (err || results.length === 0) {  
   res.status(401).send({ success: false, message: 'Invalid credentials!' });  
  } else {  
   req.session.user = results[0];  
   res.send({ success: true, message: 'Login successful! Redirecting to payment...', redirect: '/homepage' });  
  }  
  });  
});  

// Protected page
app.get('/protected-page', (req, res) => {  
  if (req.session.user) {  
   res.send('Welcome, ' + req.session.user.username + '!');  
  } else {  
   res.status(401).send('You are not logged in!');  
  }  
});  

app.listen(3000, () => {  
  console.log('Server listening on port 3000');  
});
