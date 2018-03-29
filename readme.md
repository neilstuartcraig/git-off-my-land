# git-off-my-land
[![Travis CI build status](https://travis-ci.org/neilstuartcraig/git-off-my-land.svg?branch=master)](https://travis-ci.org/neilstuartcraig/git-off-my-land)
![Snyk status](https://snyk.io/package/npm/git-off-my-land/badge.svg)

## Overview
`git-off-my-land` is a [git](https://git-scm.com/) [pre-commit hook](https://git-scm.com/book/gr/v2/Customizing-Git-Git-Hooks) which aims to detect security-sensitive files which have been accidentally included in the commit - _before they leave your computer_.

The hook runs at the `pre-commit` phase and prevents the commit from completing if any violations are found. Only git source-controlled files are included in the scan so scans are usually fast. You can of course ignore files if they  are false positives.

`git-off-my-land` currently scans ascii (not binary) content and checks filename extensions of all committed files for the following file types:

* RSA, DSA and EC certificates and private keys (by content and file extension)
* PKCS12 and PCKS7 certificates (by file extension)
* DER certificates (by file extension)
* Amazon/AWS access tokens and secrets (by content)

Content scans can detect certificates, key, secrets etc. which are wrapped/embedded inside other files.  

`git-off-my-land` is intended to be operating-system agnostic and uses raw git commands so it should woth with any git-based service e.g. github, gitlab etc.


## Prerequisites
You will need to have the following installed on your computer:  

* [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) (NPM is included in the installers from nodejs.org)
* [git](https://git-scm.com/)


## Installation
You will need an initialised:  
* git repo (see [Initialising git](#initialising-git))
* npm repo (see [Initialising npm](#initialising-npm))

```
npm install git-off-my-land --save-dev
```

This will install `git-off-my-land` and its dependencies then will add a `config` directory/folder which contains a configuration file - you can edit this file to customise the behaviour during scanning, the file contains notes on the format, data types etc. The final thing the installer does is to add the `pre-commit` hook into `.git/` (which is created via `git init`).  

Assuming that was all successful, every time you run `git commit ...` in your repo, `git-off-my-land` will scan the committed files. If the committed files do not contain any violations, `git-off-my-land` will be almost invisible and will not get in your way, but if violations _are_ detected `git-off-my-land` will show you the violations and prevent the `git commit` from completing. This means that problematic files will not make it into the commit and thus will not leave your computer even if you continue to run a `git push`.

### Updating
If you have an old version of `git-off-my-land`, you can simply re-run `npm install git-off-my-land --save-dev`. The installer won't overwrite existing config or pre-commit hook files, rather it will create a new file which includes a timestamp in the filename. Since it's not possiible for the installer to easily determine whether you modified either the config or pre-vommit hook file, you will need to manually review/replace them as appropriate. 


### Initialising git
You can initialise a git repo by running the following in the root of your codebase:

```
git init
```


### Initialising npm
You can initialise an npm repo by running the following in the root of your codebase:

```
npm init
```

You'll be asked a few questions and then you'll see a `package.json` file appear (probaby with a `package-lock.json` file too on modern versions of npm).

It's worth noting for anyone not familiar with npm and node that you'll want to add `node_modules/` to your `.gitignore` file to avoid uploading your npm dependencies to your git remote. You can do this via:

```
echo "node_modules/" >> .gitignore
```

### Known bug/issue with Node < 8
Currently, if you are running a Node runtime which is older than Node 9, you will probably get an error the first time you run `git commit ...` saying:

```
Error: Command failed: git status --porcelain
```

Simply re-running the `git commit ...` should succeed. This bug/issue is captured in https://github.com/neilstuartcraig/git-off-my-land/issues/7.

## Semver
This project aims to maintain the [semver](http://semver.org/) version numbering scheme.


## Changelog
See the [changelog](./changelog.md) file


## To do
* Fix unit tests for `throws()` in tests
* Add integration test for `runGitHook()` so we can check via Travis if it works on e.g. Windows
* Add an easy CLI way to add violating files to ignore list if they violation is bogus
* Add an optional output message to show how long the scan took
* Add a "scan all files" method


## Contributing
Contributions are *very* welcome for fixes, improvements, new features, documentation, bug reports and/or ideas. Please create a Github issue initially so we can discuss and agree actions/approach - that should save time all-round.

The ideal way to receive contributions is via a [Github Pull Request](https://help.github.com/articles/using-pull-requests/) from the master branch. Please ensure that at least unit tests (you can run these via `npm test`) and if possible, linter rules (`npm run lint`).

If you find a sensitive, security issue with this application, please email me privately in the first instance: `neil [dot] craig [at] thedotproduct [dot] org`.

### Known issue with Node < 8
Node runtime versions < 8 currently cannot run the unit tests (`npm t` or `npm run test`). This is due to (i believe) a misconfiguration of Ava, see https://github.com/neilstuartcraig/git-off-my-land/issues/3.


## License
[Apache 2.0 license](./license.md)
