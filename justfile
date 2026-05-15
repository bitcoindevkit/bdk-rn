[group("Repo")]
[doc("Default command; list all available commands.")]
@list:
  just --list --unsorted

[group("Repo")]
[doc("Open repo on GitHub in your default browser.")]
repo:
  open https://github.com/thunderbiscuit/bdk-rn

[group("Repo")]
[doc("Remove all build files.")]
clean:
  rm -rf ./cpp/
  rm -rf ./src/generated/
  rm -rf ./lib/
  rm -rf ./node_modules/
  rm -rf ./bdk-ffi/bdk-ffi/target/
  rm -f ./*.tgz

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

[group("Submodule")]
[doc("Regenerate the async-sync patches from the current submodule working tree.")]
submodule-regen-patch:
  cd ./bdk-ffi/ \
  && git diff --unified=3 HEAD -- bdk-ffi/Cargo.toml > ../patches/bdk-ffi-async-sync-cargo.patch \
  && git diff --unified=3 HEAD -- bdk-ffi/src/lib.rs > ../patches/bdk-ffi-async-sync-lib.patch \
  && git diff --unified=3 HEAD -- bdk-ffi/src/esplora.rs > ../patches/bdk-ffi-async-sync-esplora.patch \
  && git diff --unified=3 HEAD -- bdk-ffi/src/electrum.rs > ../patches/bdk-ffi-async-sync-electrum.patch

[group("Submodule")]
[doc("Apply the async-sync patches to the bdk-ffi submodule.")]
submodule-apply-patch:
  cd ./bdk-ffi/ \
  && git reset --hard HEAD \
  && git apply -C1 ../patches/bdk-ffi-async-sync-cargo.patch \
  && git apply -C1 ../patches/bdk-ffi-async-sync-lib.patch \
  && git apply -C1 ../patches/bdk-ffi-async-sync-esplora.patch \
  && git apply -C1 ../patches/bdk-ffi-async-sync-electrum.patch

[group("Build")]
[doc("Build the tarball for Android only.")]
build-tarball-android:
  pnpm install --ignore-scripts
  pnpm ubrn:android --config ubrn.config.yaml
  pnpm pack

[group("Build")]
[doc("Build the tarball for iOS only.")]
build-tarball-ios:
  pnpm install --ignore-scripts
  pnpm ubrn:ios --config ubrn.config.yaml
  pnpm pack

[group("Build")]
[doc("Build the release tarball with ready for both iOS and Android.")]
build-tarball:
  pnpm install --ignore-scripts
  pnpm ubrn:android --config ubrn.config.yaml
  pnpm ubrn:ios --config ubrn.config.yaml
  pnpm pack

[group("Docs")]
[doc("Serve the docs locally.")]
docs:
  uv run zensical serve
