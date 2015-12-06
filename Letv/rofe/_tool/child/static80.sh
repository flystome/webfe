#!/bin/bash
path="letvs/res/dest"
cd ./$path
nohup node server.js &
echo $1$path