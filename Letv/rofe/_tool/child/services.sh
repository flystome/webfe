#!/bin/bash
path="letvs/le_services"
cd ./$path
nohup node server.js &
echo $1$path
