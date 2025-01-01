#!bin/bash
sudo apt update
sudo apt install openjdk-11-jdk
docker run --name sonar -d -p 9000:9000 sonarqube:lts
npx sonarqube-scanner -Dsonar.login=squ_7f53a5ff6a5dda46b3598d4801f98ecd0251a405


