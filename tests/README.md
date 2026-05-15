# Readme

## Run The Tests

```shell
npm install

# Terminal 1: Monitor the logs
adb logcat -c && adb logcat -s ReactNativeJS | tee tests.log

# Terminal 2: Start metro
npx react-native start
# npm start

# Terminal 3: Build the app and run the tests
npm run android
```
