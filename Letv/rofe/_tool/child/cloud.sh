#!/bin/bash
path="letvs/le_cloud"
cd ./$path
nohup node server.js &
echo $1$path