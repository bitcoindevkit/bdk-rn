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
- [ ] Create and push the signed tag on the commit with the bumped version.
      Pushing the tag does not publish anything

```shell
git tag v1.1.0 --sign --edit
git push upstream v1.1.0
```

- [ ] Rehearse the release: run the Release workflow from the tag without
      `publish`. It builds everything and runs `npm publish --dry-run`
- [ ] Publish: run the Release workflow from the tag with `publish` checked. It
      publishes to npm and creates the GitHub release with the same tarball attached

```shell
gh workflow run release.yml --repo bitcoindevkit/bdk-rn --ref v1.1.0                        # rehearse
gh workflow run release.yml --repo bitcoindevkit/bdk-rn --ref v1.1.0 --field publish=true   # publish
```

- [ ] Check the workflow succeeded and `npm view bdk-rn dist-tags` shows the new version
- [ ] Let people know!

- [ ] Bump the `next` version on `master`
