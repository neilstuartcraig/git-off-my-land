# git-off-my-land

[![Travis CI build status](https://travis-ci.org/gh-username/git-off-my-land.svg)](https://travis-ci.org/neilstuartcraig/git-off-my-land)


## Overview

`git-off-my-land` is a [git](https://git-scm.com/) [pre-commit hook](https://git-scm.com/book/gr/v2/Customizing-Git-Git-Hooks) which tries to detect files which have been accidentally included in the commit.  

The hook runs `pre-commit` and prevents the commit from completing if any violations are found. Only git source-controlled files are included in the scan. You can of course ignore files if they  are false positives.

`git-off-my-land` currently tests ascii (not binary) content and filename extensions of all committed files for the following file types:

* RSA, DSA and EC certificates and private keys (by content and file extension)
* PKCS12 and PCKS7 certificates (by file extension)
* DER certificates (by file extension)
* Amazon/AWS access tokens and secrets (by content)

Content scans include certificates, key, secrets etc. which are wrapped/embedded inside other files.  

`git-off-my-land` is intended to be operating-system agnostic and uses raw git commands so it should woth with any git-based service e.g. github, gitlab etc.


## Prerequisites
* [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) (NPM is included in the installers from nodejs.org)
* [git](https://git-scm.com/)


## Installation

You will need an initialised git repo. If you don't have this yet, see `Initialising git` (below)  
You will need an initialised npm repo. If you don't have this yet, see `Initialising npm` (below)

```
npm install git-off-my-land --save-prod
```

This will install `git-off-my-land` and its dependencies then will add a `config` direectory/folder which contains a configuration file - you can edit this file to customise the behaviour during scanning, the file contains notes on the format, data types etc. The final thing the installer does is to add the `pre-commit` 

Assuming that was all successful, every time you run `git commit ...` in your repo, `git-off-my-land` will scan the committed files. If the committed files do not contain any violations, `git-off-my-land` will be invisible but if violations _are_ detected, `git-off-my-land` will show you the violations and prevent the `git commit` from completing.


### Initialising git

If you haven't already, you need to initialise git in the root of your codebase via:

```
git init
```


### Initialising npm

If you haven't already, you need to initialise npm in the root of your git repo via:

```
npm init
```

You'll be asked a few questions and then you'll see a `package.json` file appear (probaby with a `package-lock.json` file too on modern versions of npm).

It's worth noting for anyone not familiar with npm and node that you'll want to add `node_modules/` to your `.gitignore` file to avoid uploading your npm dependencies to your git remote. You can do this via:

```
echo "node_modules/" >> .gitignore
```

Assuming your npm repo is set up, you can now install `git-off-my-land` via:



## Semver
This project aims to maintain the [semver](http://semver.org/) version numbering scheme.


## Changelog
See the [changelog](./changelog.md) file


## To do

* Fix unit tests for `throws()` in tests
* Set up Travis
* Add integration test for `runGitHook()` so we can check via Travis if it works on e.g. Windows
* Make the postinstall script add the pre-commit file (and make sure it does install the config file)
* Add an easy CLI way to add violating files to ignore list if they violation is bogus
* Add tests for `.pfx` etc.
* Add a "scan all files" method



## Contributing
Contributions are *very* welcome for fixes, improvements, new features, documentation, bug reports and/or ideas. Please create a Github issue initially so we can discuss and agree actions/approach - that should save time all-round.

The ideal way to receive contributions is via a [Github Pull Request](https://help.github.com/articles/using-pull-requests/) from the master branch. Please ensure that at least unit tests (you can run these via `npm test`) and if possible, linter rules (`npm run lint`).

If you find a sensitive, security issue with this application, please email me privately in the first instance: `neil [dot] craig [at] thedotproduct [dot] org`.


## License
[Apache 2.0 license](./license.md)
