#!/usr/bin/env bash

ARG1=${1:-$(date +"%Y-%m-%d")}

cat .events/$ARG1.log \
  | jq 'select(.type == "PROFILE_CREATED") | {profile, referrer, search}'
