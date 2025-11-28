[group("Repo")]
[doc("Default command; list all available commands.")]
@list:
  just --list --unsorted

[group("Repo")]
[doc("Open repo on GitHub in your default browser.")]
repo:
  open https://github.com/thunderbiscuit/bdk-react-native

[group("Repo")]
[doc("Remove all build files.")]
clean:
  rm -rf ./cpp/
  rm -rf ./src/generated/
  rm -rf ./lib/

[group("Submodule")]
[doc("Initialize bdk-ffi submodule to committed hash.")]
submodule-init:
  git submodule update --init

[group("Submodule")]
[doc("Hard reset the bdk-ffi submodule to committed hash.")]
submodule-reset:
  git submodule update --force

[group("Submodule")]
[doc("Checkout the bdk-ffi submodule to the latest commit on master.")]
submodule-to-master:
  cd ./bdk-ffi/ \
  && git fetch origin \
  && git checkout master \
  && git pull origin master

[group("Build")]
[doc("Required for building the library correctly.")]
rename-library:
  sed -i.bak '/^\[package\]/,/^\[/ s/^name *= *".*"/name = "bdkffi"/' bdk-ffi/bdk-ffi/Cargo.toml
  rm -f bdk-ffi/bdk-ffi/Cargo.toml.bak

[group("Build")]
[doc("Build Android library.")]
build-android:
  yarn ubrn:android --config ubrn.config.yaml

[group("Build")]
[doc("Build the tarball for Android.")]
build-tarball:
  yarn ubrn:android --config ubrn.config.yaml
  npm pack

[group("Examples")]
[doc("Launch Android example app.")]
launch-android:
  cd example && npm install && npm run android
