---
name: Release
about: Create a new release [for release managers only]
title: "Release MAJOR.MINOR.PATCH"
labels: "release"
assignees: ""
---

- [ ] Create a new branch `release/X.X`
- [ ] Bump the submodule to a release tag
- [ ] Apply the patches
- [ ] Run the tests
- [ ] Build and test both example apps

```shell
cd bdk-ffi/
git fetch --all
git checkout <tag>
cd ..
just apply-submodule-patches
just clean
just build-tarball
cd tests/
just clean
just test # (needs a running Android emulator)
cd ../example/
just install
just run-android
just pod-install
just run-ios
```

- [ ] Create the tag
- [ ] Build the tarball
- [ ] Sign the artifact
- [ ] Create the release on GitHub
- [ ] Let people know!

```shell
git tag v1.1.0 --sign --edit
git push upstream v1.1.0
```

- [ ] Bump the `next` version on `master`
