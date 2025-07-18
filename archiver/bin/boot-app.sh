#!/bin/sh

if [ "$RUN_SCHEDULER" = "true" ]; then
	echo "Running scheduler"
	if [ "$NODE_ENV" = "production" ]; then
		node ./dist/scheduler.js
	else
		npm run start:scheduler
	fi
	exit 0
fi

if [ "$NODE_ENV" = "production" ]; then
	node ./dist/server.js
else
	npm run start
fi
