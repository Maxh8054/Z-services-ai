#!/bin/bash
cd /home/z/my-project
while true; do
  node node_modules/.bin/next dev -p 3000 > /tmp/next-direct.log 2>&1
  echo "Server died, restarting in 2s..." >> /tmp/next-direct.log
  sleep 2
done