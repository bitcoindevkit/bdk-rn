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
just submodule-apply-patch
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

- [ ] Bump the version in `package.json` and merge it
- [ ] Create and push the signed tag, pointing at the commit with the bumped
      version (the workflow fails if the tag and `package.json` disagree).
      This triggers the release workflow, which builds the binaries, creates
      the GitHub Release with checksums, and publishes to npm

```shell
git tag v1.1.0 --sign --edit
git push upstream v1.1.0
```

- [ ] Verify the release workflow succeeded (GitHub Release assets + npm)
- [ ] Let people know!

- [ ] Bump the `next` version on `master`
