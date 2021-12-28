#!/bin/bash
export winhost=$(cat /etc/resolv.conf | grep nameserver | awk '{ print $2 }')
if [ ! -n "$(grep -P "[[:space:]]winhost" /etc/hosts)" ]; then
	printf "%s\t%s\n" "$winhost" "winhost" | sudo tee -a "/etc/hosts"
fi
