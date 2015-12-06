#!/bin/bash
arg=$1;
arg_arr=$2
arr=(8085 8888 8003 8081);

function kill_pro(){
	#echo "kill -9 " $1;
	#echo "[YWC]:[" $1 "][" $2 "]"
	kill -9 $1;
};
export -f kill_pro;

function kill_pro2(){
	list=$3;
	list=(8085 8888 8003 8081);
	#echo "kill_pro2.PARAM:"$@;
	pidStr=$1;
	portStr=$2;
	pid=${pidStr%/*}
	port=${portStr#*:}
	#echo "[YWC]:1.[" $1 "]2.[" $2 "]pid.[" $pid "]port.[" $port "]";

	for var in ${list[@]};
	do
		if [ $var -eq $port ]
		then
			echo "kill -15 " $pid "[port:" $port "]"
			kill -15 $pid;
		#else
			#echo $port ":else:" $var
		fi
	done
	#kill -9 $1;
};
export -f kill_pro2;

function kill_pro3(){
	argPort=$3;
	pidStr=$1;
	portStr=$2;
	pid=${pidStr%/*}
	port=${portStr#*:}
	#echo "[YWC]:1.[" $1 "]2.[" $2 "]pid.[" $pid "]port.[" $port "]";

	#echo $argPort $port

	if [ $argPort -eq $port ]
	then
		echo 'kill -15 ' $pid '[port:' $port ']';
		#echo $pid ":kill_pro3.if";
		kill -15 $pid;
	#else
		#echo $port ":else"
	fi
};
export -f kill_pro3;

#lsof -i -P | grep -E -i '^node\s*(\d+).*tcp.*8090.*listen.*' | awk '{system("kill_pro "$2);print "kill " $2}';

process2()
{
	echo "--------------------------process2以下是查看进程运行情况-------------------------"
	for var in ${arr[@]};
	do
		lsof -i -P | grep -E -i '^node\s*(\d+).*tcp.*'$var'\D.*listen.*';
	done;

	echo "--------------------------以下是杀进程-------------------------------------------"
	# kill 
	for var in ${arr[@]};
	do
		lsof -i -P | grep -E -i '^node\s*(\d+).*tcp.*'$var'\D.*listen.*' | awk '{system("kill_pro "$2 " " $1);print "kill -9 " $2 "(端口是" '$var' ")"}';
	done

	echo "--------------------------以下是杀结果-------------------------------------------"
	#search
	for var in ${arr[@]};
	do
		lsof -i -P | grep -E -i '^node\s*(\d+).*tcp.*'$var'\D.*listen.*';
	done;

	echo "--------------------------服务已经停止完成---------------------------------------"
}

# =1
process1(){
	echo "--------------------------process1以下是查看进程运行情况-------------------------"
	sudo netstat -lntp | grep node

	echo "--------------------------以下是杀进程-------------------------------------------"

	echo ${arr[*]} ":pro1"
	# kill 
	sudo netstat -lntp | grep node | awk -v v2=$arr '{system("kill_pro2 "$7 " " $4 " " v2)}';

	echo "--------------------------以下是杀结果-------------------------------------------"

	#search
	sudo netstat -lntp | grep node

	echo "--------------------------服务已经停止完成---------------------------------------"
}

# 120上关掉某一端口进程 >10
process3(){
	pro3Port=$1
	echo "--------------------------process3以下是查看进程运行情况-------------------------"
	sudo netstat -lntp | grep node

	echo "--------------------------以下是杀进程-------------------------------------------"
	# kill 
	sudo netstat -lntp | grep node | awk -v v1=$pro3Port '{system("kill_pro3 "$7 " " $4 " " v1)}';

	echo "--------------------------以下是杀结果-------------------------------------------"

	#search
	sudo netstat -lntp | grep node

	echo "--------------------------服务已经停止完成---------------------------------------"
}



# 120 机器上删除列表里的端口用 eg. sh ./stopServer.sh  1
if [ $arg -eq 1 ]
then
	process1

# 120 删除指定端口用 eg. sh ./stopServer.sh  8003
elif [ $arg -gt 10 ]
then
	process3 $arg

# 我本地mac机器上删除列表里的端口用 eg. sh ./stopServer.sh
else
	process2
fi