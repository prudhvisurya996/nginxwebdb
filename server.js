const express = require('express');  
const app = express();  
const cookieParser = require('cookie-parser');  
const session = require('express-session');  
const mysql = require('mysql');  
const path = require('path'); // For handling file paths
const scanner = require('sonarqube-scanner'); // SonarScanner

// MySQL Database Configuration
const db = mysql.createConnection({  
  host: 'database-1.cz46w44qmpqp.us-east-1.rds.amazonaws.com',  
  user: 'admin',  
  password: 'Singham11',  
  database: 'users'  
});  

db.connect((err) => {  
  if (err) {  
    console.error('Error connecting:', err);  
    return;  
  }  
  console.log('Connected as ID ' + db.threadId);  
});  

// Middleware
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  
app.use(cookieParser());  
app.use(session({  
  secret: 'mysecretkey',  
  resave: false,  
  saveUninitialized: true,  
  cookie: { secure: false }  
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes for serving HTML files
app.get('/register', (req, res) => res.sendFile('register.html', { root: path.join(__dirname, 'public') }));
app.get('/login', (req, res) => res.sendFile('login.html', { root: path.join(__dirname, 'public') }));
app.get('/', (req, res) => res.sendFile('index.html', { root: path.join(__dirname, 'public') }));
app.get('/homepage', (req, res) => res.sendFile('Homepage.html', { root: path.join(__dirname, 'public') }));

// Registration Endpoint
app.post('/register', (req, res) => {  
  const { username, email, password } = req.body;  
  const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;  
  db.query(query, [username, email, password], (err) => {  
    if (err) {  
      res.status(400).send({ success: false, message: 'Registration failed!' });  
    } else {  
      res.send({ success: true, message: 'Registration successful! Redirecting to login...', redirect: '/login' });
    }  
  });  
});  

// Login Endpoint
app.post('/login', (req, res) => {  
  const { email, password } = req.body;  
  const query = `SELECT * FROM users WHERE email = ? AND password = ?`;  
  db.query(query, [email, password], (err, results) => {  
    if (err || results.length === 0) {  
      res.status(401).send({ success: false, message: 'Invalid credentials!' });  
    } else {  
      req.session.user = results[0];  
      res.send({ success: true, message: 'Login successful! Redirecting to homepage...', redirect: '/homepage' });  
    }  
  });  
});  

// Protected Page
app.get('/protected-page', (req, res) => {  
  if (req.session.user) {  
    res.send('Welcome, ' + req.session.user.username + '!');  
  } else {  
    res.status(401).send('You are not logged in!');  
  }  
});

// SonarScanner Integration
const runSonarScanner = () => {
  scanner(
    {
      serverUrl: "http://localhost:9000", // SonarQube server URL
      token: "your_sonar_token", // Replace with your token
      options: {
        "sonar.projectKey": "nodejs-project",
        "sonar.sources": ".",
        "sonar.exclusions": "node_modules/**,coverage/**",
        "sonar.language": "js",
        "sonar.javascript.lcov.reportPaths": "coverage/lcov.info" // If using coverage
      }
    },
    () => {
      console.log("SonarScanner completed.");
    }
  );
};

// Route to trigger SonarScanner
app.get('/run-sonar', (req, res) => {
  runSonarScanner();
  res.send('SonarScanner initiated. Check logs for details.');
});

// Start the server
app.listen(3000, () => {  
  console.log('Server listening on port 3000');  
});
