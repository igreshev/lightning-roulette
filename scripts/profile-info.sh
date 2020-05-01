#!/usr/bin/env bash

var1=$(echo $1 | cut -f1 -d-);
var2=$(echo $1 | cut -f2 -d-);

cat .events/*.log | jq --arg PROFILE $var1 --arg TOKENS $var2 \
  'select(.type == "PROFILE_CREATED") | select(.profile == $PROFILE) + {"deposits": $TOKENS}'
