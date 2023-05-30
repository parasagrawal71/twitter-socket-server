#! /bin/bash

echo 'Removing tagged images'
docker rmi gcr.io/twitter-socket-server:1.0.0

echo 'Removing existing images'
docker rmi twitter-socket-server:1.0.0

echo 'Creating new image for twitter-socket-server'
docker build --tag twitter-socket-server:1.0.0 . --platform linux/amd64