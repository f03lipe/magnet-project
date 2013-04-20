while true
do
	sleep .1
	echo Thu Apr 11 05:21:41 BRT 2013
	lessc main.less main.css -x
	if [[ $? != 0 ]]
		then beep -f 200 -l 5
		sleep 1
	fi
done
