#!/usr/bin/env sh

# abort on errors
set -e

npm run build

cd dist

git add dist
git commit -m 'deploy'

git subtree push --prefix dist origin gh-pages

cd -
