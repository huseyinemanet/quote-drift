#!/usr/bin/env bash

set -euo pipefail

PROJECT_ABBREVIATION="RNGoogleMobileAds"
JSON_FILE_NAME="app.json"
JSON_ROOT="'react-native-google-mobile-ads'"
JSON_OUTPUT_BASE64='e30='
PLIST_BUDDY=/usr/libexec/PlistBuddy
TARGET_PLIST="${BUILT_PRODUCTS_DIR}/${INFOPLIST_PATH}"
SOURCE_PLIST="${PROJECT_DIR}/${INFOPLIST_FILE}"
DSYM_PLIST="${DWARF_DSYM_FOLDER_PATH}/${DWARF_DSYM_FILE_NAME}/Contents/Info.plist"
SEARCH_DIR="${PROJECT_DIR}"
SEARCH_RESULT=""
IOS_APP_ID=""

PLIST_ENTRY_KEYS=()
PLIST_ENTRY_TYPES=()
PLIST_ENTRY_VALUES=()

set_plist_value() {
  echo "note:      setting plist entry '$1' of type '$2' in file '$4'"
  "${PLIST_BUDDY}" -c "Add :$1 $2 '$3'" "$4" || echo "note:      '$1' already exists"
}

get_json_key_value() {
  ruby -KU -e "require 'rubygems';require 'json'; output=JSON.parse('$1'); puts output[$JSON_ROOT]['$2']" 2>/dev/null || true
}

echo "note: -> ${PROJECT_ABBREVIATION} build script started"
echo "note: 1) Locating ${JSON_FILE_NAME} file:"

for _ in 1 2; do
  SEARCH_DIR="$(dirname "${SEARCH_DIR}")"
  [[ "${SEARCH_DIR}" == *.generated ]] && continue
  [[ "${SEARCH_DIR}" == "/" ]] && break
  echo "note:      Searching in '${SEARCH_DIR}' for a ${JSON_FILE_NAME} file."
  SEARCH_RESULT="$(find "${SEARCH_DIR}" -maxdepth 2 -name "${JSON_FILE_NAME}" -print | /usr/bin/head -n 1)"
  [[ -n "${SEARCH_RESULT}" ]] && break
done

if [[ -n "${SEARCH_RESULT}" ]]; then
  echo "note:      ${JSON_FILE_NAME} found at ${SEARCH_RESULT}"
  JSON_OUTPUT_RAW="$(cat "${SEARCH_RESULT}")"
  RN_ROOT_EXISTS="$(ruby -KU -e "require 'rubygems';require 'json'; output=JSON.parse('$JSON_OUTPUT_RAW'); puts output[$JSON_ROOT]" 2>/dev/null || true)"

  if [[ -n "${RN_ROOT_EXISTS}" ]]; then
    JSON_OUTPUT_BASE64="$(python3 - <<PY
import json, base64
with open(${SEARCH_RESULT@Q}, 'rb') as fh:
    data = json.loads(fh.read())
print(base64.b64encode(json.dumps(data['react-native-google-mobile-ads']).encode()).decode())
PY
)"
    IOS_APP_ID="$(get_json_key_value "$JSON_OUTPUT_RAW" "ios_app_id")"
  fi
else
  echo "note:   An ${JSON_FILE_NAME} file was not found, whilst this file is optional it is recommended to include it to auto-configure services."
fi

PLIST_ENTRY_KEYS+=("google_mobile_ads_json_raw")
PLIST_ENTRY_TYPES+=("string")
PLIST_ENTRY_VALUES+=("${JSON_OUTPUT_BASE64}")

if [[ -n "${IOS_APP_ID}" ]]; then
  PLIST_ENTRY_KEYS+=("GADApplicationIdentifier")
  PLIST_ENTRY_TYPES+=("string")
  PLIST_ENTRY_VALUES+=("${IOS_APP_ID}")
fi

echo "note: 2) Injecting Info.plist entries:"
for i in "${!PLIST_ENTRY_KEYS[@]}"; do
  echo "    ->  $i) ${PLIST_ENTRY_KEYS[$i]} ${PLIST_ENTRY_TYPES[$i]} ${PLIST_ENTRY_VALUES[$i]}"
done

if [[ ! -f "${TARGET_PLIST}" ]]; then
  if [[ -f "${SOURCE_PLIST}" ]]; then
    echo "note:      built Info.plist not ready yet, falling back to source plist at ${SOURCE_PLIST}"
    TARGET_PLIST="${SOURCE_PLIST}"
  else
    echo "error: unable to locate Info.plist to set properties."
    exit 1
  fi
fi

if [[ -z "${IOS_APP_ID}" ]]; then
  echo "warning:  ios_app_id key not found in react-native-google-mobile-ads key in app.json. You may safely ignore this warning if you are using the Expo config plugin."
  exit 0
fi

for plist in "${TARGET_PLIST}" "${DSYM_PLIST}"; do
  [[ -f "${plist}" ]] || continue
  for i in "${!PLIST_ENTRY_KEYS[@]}"; do
    set_plist_value "${PLIST_ENTRY_KEYS[$i]}" "${PLIST_ENTRY_TYPES[$i]}" "${PLIST_ENTRY_VALUES[$i]}" "${plist}"
  done
done

echo "note: <- ${PROJECT_ABBREVIATION} build script finished"
