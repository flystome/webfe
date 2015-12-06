#!/bin/bash
path="letvs/le_luyou"
cd ./$path
nohup node server.js &
echo $1$path