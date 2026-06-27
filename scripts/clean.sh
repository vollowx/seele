#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." || exit 1

shopt -s globstar
rm ./src/**/*-styles.css.ts
rm ./src/**/*.js
