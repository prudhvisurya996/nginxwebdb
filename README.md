# nginxwebdb
nginxwebdb


CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


docker build -t surya:v1 .
docker run  --name nodejs-app -d -p 3000:3000 nodejs-project

