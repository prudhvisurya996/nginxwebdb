#!bin/bash
sudo apt update
sudo apt install openjdk-11-jdk
docker run --name sonar -d -p 9000:9000 sonarqube:lts

