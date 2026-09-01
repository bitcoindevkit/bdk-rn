# This script will build the website and push it to the gh-pages branch,
# publishing it automatically to https://bitcoindevkit.github.io/bdk-rn/.

set -euo pipefail

rm -rf ./site/*
just docs-build
cd ./site/
git init .
git switch --create gh-pages
git add .
git commit --message "Deploy $(date +"%Y-%m-%d")"
git remote add upstream git@github.com:bitcoindevkit/bdk-rn.git
git push upstream gh-pages --force
cd ..
