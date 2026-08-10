#!/usr/bin/env bash
#
# Build, install and run the integration test app on an already-running Android
# emulator or device, then turn its logcat output into a process exit code.
#
# The app runs its tests on launch and prints results to the JS console (see
# tests/tests/testRunner.ts), finishing with either [TEST RUN PASSED] or
# [TEST RUN FAILED]. There is no instrumentation runner to give us an exit
# status, so we watch logcat for those sentinels.
#
# A release build is used deliberately: it embeds the JS bundle in the APK, so
# no Metro dev server has to be kept alive alongside the emulator. The release
# buildType is signed with the debug keystore (see android/app/build.gradle),
# so this needs no signing secrets.
#
# Usage: tests/scripts/run-android-tests.sh
# Env:
#   TEST_TIMEOUT_SECONDS  how long to wait for the run to finish (default 300)

set -euo pipefail

TESTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TIMEOUT="${TEST_TIMEOUT_SECONDS:-300}"
APP_ID="com.tests"
LOG_FILE="${TESTS_DIR}/tests.log"

cd "${TESTS_DIR}"

echo "==> Waiting for a device"
adb wait-for-device
until [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do
  sleep 2
done

echo "==> Building and installing the release APK"
# installRelease covers assemble + install, and skips the Metro dev server.
(cd android && ./gradlew :app:installRelease --console=plain)

echo "==> Launching ${APP_ID}"
adb logcat -c
adb shell am start -n "${APP_ID}/.MainActivity" > /dev/null

echo "==> Waiting up to ${TIMEOUT}s for the test run to finish"
elapsed=0
while [ "${elapsed}" -lt "${TIMEOUT}" ]; do
  adb logcat -d -s ReactNativeJS > "${LOG_FILE}" 2>/dev/null || true
  if grep --quiet --fixed-strings -e '[TEST RUN PASSED]' -e '[TEST RUN FAILED]' "${LOG_FILE}"; then
    break
  fi
  sleep 2
  elapsed=$((elapsed + 2))
done

adb logcat -d -s ReactNativeJS > "${LOG_FILE}" 2>/dev/null || true

echo
echo "================ test output ================"
cat "${LOG_FILE}"
echo "============================================="
echo

if grep --quiet --fixed-strings '[TEST RUN PASSED]' "${LOG_FILE}"; then
  echo "All integration tests passed."
  exit 0
fi

if grep --quiet --fixed-strings '[TEST RUN FAILED]' "${LOG_FILE}"; then
  echo "Integration tests failed." >&2
  exit 1
fi

echo "Timed out after ${TIMEOUT}s without reaching [TEST RUN PASSED] or [TEST RUN FAILED]." >&2
echo "The app may have crashed on launch; full logcat follows." >&2
adb logcat -d -t 500 >&2 || true
exit 1
