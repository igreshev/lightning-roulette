#!/usr/bin/env bash

echo 'deploying services...'
scp -r ./services/*.json ./services/*.js ./services/lib roulette:services/
echo 'installing npm dependencies...'
ssh roulette "cd ~/services && npm install"
ssh roulette "cd ~/services && chmod +x withdraw.js deposit.js events.js"
