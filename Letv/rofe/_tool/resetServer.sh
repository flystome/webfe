#!/bin/bash
arg=$1;
arr=(8085 8888 8003 8081);

process()
{
	#http://blog.chinaunix.net/uid-21505614-id-289478.html
	echo "\033[99;55;31m\033[5m==========================服务已经起动开始121=============================\033[0m"

	pwd
	sh ./_tool/stopServer.sh

	root_dir="/Users/ywchen/svn/fe/"
	cd $root_dir

	arr=("rock" "static" "cloud" "luyou");
	for var in ${arr[@]};
	do
		cd $root_dir;
		sh ./_tool/child/"$var".sh $root_dir &
	done;

	echo "\033[99;55;31m==========================服务已经起动完成=============================\033[0m"


    #ls LOGFILE
    date
    sleep 2

}


process()
{
	date
	root_dir="/Users/ywchen/svn/fe/"
	processArg=$1;
	param_e=""

	if [ -z $processArg ]
	then
		# 我的Mac机器上的路径
		root_dir="/Users/ywchen/svn/fe/"
		param_e=""
	else
		# 120 机器的路径
		root_dir="/home/heliang/fe/fe/"
		param_e="-e"
	fi
	echo $param_e "\033[99;55;31m\033[5m==========================服务已经起动开始========================================\033[0m"

	echo "param:" $processArg

	cd $root_dir"rofe/code"
	sh ./_tool/stopServer.sh $processArg

	cd ./_tool/child
	for filename in `ls`
	do
		cd $root_dir
		sh ./_tool/child/"$filename" $root_dir &
		cd $root_dir
	done

	echo $param_e "\033[22;33;35m..........................程序在启动中请稍候.....................................\033[0m"
	sleep 2

	echo "--------------------------以下是查看启动结果--------------------------------------"
	
	if [ -z $processArg ]
	then
		# 我的Mac机器上的
		for var in ${arr[@]};
		do
			lsof -i -P | grep -E -i '^node\s*(\d+).*tcp.*'$var'\D.*listen.*';
		done;
	else
		# 120 机器的路径
		sudo netstat -lntp | grep node
	fi

	echo $param_e "\033[99;55;31m==========================服务已经起动完成========================================\033[0m"
}


process $arg


#result=$!
#LOGFILE="log.txt"
#process
#
#exec 3>&1
#exec 4>&2
#exec &>$LOGFILE
#exit $?
#exec 1>&3 3>&-
#exec 2>&4 4>&-

#----------------


#LOGFILE="log.txt"
#touch $LOGFILE
#tail -f $LOGFILE &
#pid=$!
#
#exec 3>&1
#exec 4>&2
#exec &>$LOGFILE
#process
#ret=$?
#exec 1>&3 3>&-
#exec 2>&4 4>&-
#
#kill -15 $pid
#
#exit $ret

#http://bbs.chinaunix.net/thread-3775348-1-1.html      8楼

