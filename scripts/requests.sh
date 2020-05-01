#!/usr/bin/env bash

ARG1=${1:-$(date +"%Y-%m-%d")}

cat .events/$ARG1.log \
  | jq 'select(.type == "DEPOSIT_REQUEST") | {profile, tokens}' \
  | jq -s 'group_by(.profile)| .[] | {profile: .[0].profile, tokens: [.[].tokens] | join(",")}' \
  | jq '[.profile, .tokens] | join("-")' \
  | xargs -I % ./profile-info.sh %
