#!/bin/bash
path="letvs/le_pro"
cd ./$path
nohup node server.js &
echo $1$path