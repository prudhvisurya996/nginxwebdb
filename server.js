const express = require('express');
const path = require('path');
const mysql = require('mysql');
const session = require('express-session');
const cookieParser = require('cookie-parser');
//add
const uuid = require('uuid');
//payment
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'admin',
  password: 'Surya11Hygd0@',
  database: 'users'
});
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set secure: true if using HTTPS
}));

// Serve static files directly
app.use(express.static(__dirname));
// Routes

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
// Serve register page
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});
app.get('/error', (req, res) => {
  res.sendFile(path.join(__dirname,'error.html'));
});

// Serve login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve Homepage if logged in
app.get('/Homepage', (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, 'Homepage.html'));
  } else {
    res.redirect('/login');
  }
});
app.get('/forgot-password', (req, res) => {
  res.sendFile(__dirname + '/forgotpass.html');
});

// Route to handle password update
app.post('/reset-password', (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.send('Passwords do not match. Please try again.');
  }

  const query = `UPDATE users SET password = ? WHERE email = ?`;
  db.query(query, [newPassword, email], (err, result) => {
    if (err) {
      console.error('Error updating password:', err);
      return res.send('Error updating password.');
    }

    if (result.affectedRows === 0) {
      res.send('Email not found.');
    } else {
      res.send('Password updated successfully. <a href="/login.html">Login</a>');
    }
  });
});
// Registration endpoint
app.post('/register', (req, res) => {
  const { firstName, mobile, email, password } = req.body;
  const query = `INSERT INTO users (firstName, mobile, email, password) VALUES (?, ?, ?, ?)`;

  db.query(query, [firstName, mobile, email, password], (err) => {
    if (err) {
      console.error('Error during registration:', err);
      res.status(400).send({ success: false, message: 'Registration failed!' });
    } else {
      res.send({ success: true, message: 'Registration successful! Redirecting to Login page...' });
    }
  });
});
//login with activationkey
app.post('/login', (req, res) => {  
  const { email, password, activationKey } = req.body;  
  
  // Query the database to find the user based on email, password, and activation key  
  const query = `SELECT * FROM users WHERE email = ? AND password = ? AND activationKey = ?`;  
  
  db.query(query, [email, password, activationKey], (err, results) => {  
   if (err) {  
    console.error("Database error:", err);  
    return res.status(500).send({ success: false, message: 'Database error!' });  
   }  
  
   // Check if any user was found  
   if (results.length === 0) {  
    return res.status(401).send({ success: false, message: 'Invalid credentials or activation key! You can change password by using forgot password.For activationKey send an emailto support@awsdevops.com' });  
   }  
  
   const user = results[0]; // User found  
  
   // If everything is valid, create a new session  
   const sessionId = uuid.v4();  
  
   db.query(`UPDATE users SET current_session_id = ? WHERE email = ?`, [sessionId, email], (err) => {  
    if (err) {  
      console.error("Database error:", err);  
      return res.status(500).send({ success: false, message: 'Unable to save session!' });  
    }  
  
    // Set session information  
    req.session.user = user.email;  
    req.session.sessionId = sessionId;  
    res.send({ success: true, message: 'Login successful! Redirecting to Homepage...', redirect: '/Homepage' });  
   });  
  });  
});


app.get('/checkSession',(req,res)=>{
    let loggedInSession='';
    console.log("checking session for "+req.session.user +" with session id :"+req.session.sessionId);
    if (req.session.user === undefined) {
        //res.send({ success: true, message: 'Session is inactive or expired', redirect: '/login' });
        res.send({ success: true, message: '{"isLoggedIn": false}' });
    }
   else{    
    //change this query to check with email
    db.query(`select current_session_id from users where email=?`,[req.session.user], (err, result) => {
        if (err) {
            console.error("Database error:",err);
          res.status(500).send({ success: false, message: 'Unable to get the session info!' }); 
        } else if (result.length > 0) {
            loggedInSession = result[0].current_session_id;
            console.log("Logged in session:", loggedInSession);
    
            // Place any code here that depends on `loggedInSession`
            if (loggedInSession === req.session.sessionId) {
                console.log("Session is active for " + req.session.user + ", please continue");
                res.send({ success: true, message: '{"isLoggedIn": true}' });
            } else {
                req.session.destroy();
                res.send({ success: true, message: '{"isLoggedIn": false}' });
            }
        }
    
    });
}
});
//paymentcode//


// Endpoint to create a Razorpay order
// Start the server
const PORT = 4002;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

