#!/bin/bash
path="letvs/res"
cd ./$path
nohup node server.js &
echo $1$path