# git-off-my-land changelog

## v2.2.11
* Improve: test coverage - branches!

## v2.2.10
* Improve: test coverage

## v2.2.9
* Update: dependencies

## v2.2.8
* Fix: Bug in `post-install` script which meant that the config and hook files were overwritten if they existed

## v2.2.7
* Fix: Bad default on exec timeout - was 10 msec, now 10 sec
* Improve: comments on exec options in config file

## v2.2.6
* Fix: installer for node < 8.5

## v2.2.5
* Docs: Add known issue WRT Node < 8 not being able to run unit tests - https://github.com/neilstuartcraig/git-off-my-land/issues/3
* Docs: Add known issue WRT Node < 8 returning error on first run - https://github.com/neilstuartcraig/git-off-my-land/issues/7

## v2.2.4
* Misc: Migrate to-dos and linter errors to issues
* Update: version number

## v2.2.3
* Fix: incorrect version number!

## v2.2.0
* Add: Detection for existing config and hook files on reinstall

## v2.1.2
* Improve: readme.md

## v2.1.1
* Fix: post-install script to not fail on existing dir/file(s)

## v2.1.0
* Add: built-in (tested) output formatting

## v2.0.4
* Fix: Remove unintended console log "output:"

## v2.0.3
* Fix: Typo/bug in `pre-commit` handler output formatting

## v2.0.2
* Fix: Bug in handling of empty `git status` without error

## v2.0.1
* Fix: Missing prune in `scanFilteredFiles()`

## v2.0.0
* Change: output format for `violations` is now an object, one property per filename which causes >=1 rule vioations with sub-props for `content` and `extensions` which detail violations
* Change: config `filesToIgnore` is now an array of regular expressions
* Change: Ignore test fixtures by default so as not to incorrectly trip after installation

## v1.3.27
* Fix: Errors/omissions in `readme.md`

## v1.3.26
* Add: snyk protect to package.json vuln-scan script

## v1.3.25
* Fix Snyk badge in readme

## v1.3.24
* Add: Snyk badge to readme

## v1.3.23
* Fix: Run Snyk on Travis build

## v1.3.22
* Fix: Travis badge image url

## v1.3.21
* Revert: to `src` rather than `dist` for lib version used in tests

## v1.3.20
* Fix: Travis config to exclude old node versions which won't work due to regex or async/await
* Add `engines` to `package.json` to help with the above at runtime

## v1.3.19
* Fix: Trying built files in tests for node <9

## v1.3.18
* Disable Snyk for the mo - needs auth

## v1.3.17
* Fix: missing config template (remove from `.gitignore` :-))

## v1.3.16
* Fix: missing config template

## v1.3.15
* Fixing: Failing Travis tests due to (at least) `./git/hooks/` not existing on Travis

## v1.3.14
* Fixing: Failing Travis tests due to (at least) `./git/hooks/` not existing on Travis

## v1.3.13
* Fixing: Failing Travis tests due to (at least) `./git/hooks/` not existing on Travis

## v1.3.12
* Update: readme/to-do

## v1.3.11
* Tidy: postinstall script

## v1.3.10
* Fixing: postinstall script - work in progress

## v1.3.9
* Fixing: postinstall script - work in progress

## v1.3.8
* Fixing: postinstall script - work in progress

## v1.3.7
* Fixing: postinstall script - work in progress

## v1.3.6
* Fixing: postinstall script - work in progress

## v1.3.5
* Fixing: postinstall script - work in progress

## v1.3.4
* Fixing: postinstall script - work in progress

## v1.3.3
* Removed: `console.log()` from test

## v1.3.2
* Enable: Travis CI test runner

## v1.3.1
* Clarify/fix: items in readme

## v1.3.0
* Add: details to readme
* Add pfx, p7 file extensions

## v1.2.0
* Add: Unit tests for scanFilteredFiles()
* Add: EC cert detection (PEM)

## v1.1.0
* Change: require -> import
* Add: unit tests for filterFilesList()
* Fix: Linter errors

## v1.0.1
* Remove: unnecessary comments from lib
* Change: License to Apache 2, from MIT
* Remove: NPM run script

## v1.0.0
Initial version
