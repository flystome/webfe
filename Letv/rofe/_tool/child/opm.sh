#!/bin/bash
path="letvs/le_opm"
cd ./$path
nohup node server.js &
echo $1$path