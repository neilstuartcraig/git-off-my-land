#! /usr/bin/env node
"use strict";

// Note that this file is kept deliberately simple as it doesn't go through the babel build process...
// ... and yes, it's all sync and horrible but it's a post-install script so ;-)

const path = require("path");
const fs = require("fs");

const srcBaseDir = process.cwd();
const destBaseDir = process.env.INIT_CWD || process.cwd();

const configSrcDir = path.join(srcBaseDir, "/config");
console.log(`src: ${configSrcDir}`);
const configDestDir = path.join(destBaseDir, "/config");
console.log(`dest: ${configDestDir}`);

const configFilename = "git-off-my-land-config.js";
const configSrcFile = path.join(configSrcDir, "/", configFilename);
const configDestFile = path.join(configDestDir, "/", configFilename)

const hookSrcDir = path.join(srcBaseDir, "/hooks");
const hookDestDir = path.join(destBaseDir, "/.git/hooks");
const hookFilename = "pre-commit";
const hookSrcFile = path.join(hookSrcDir, "/", hookFilename);
const hookDestFile = path.join(hookDestDir, "/", hookFilename);

try
{
  // Create the ./config dir
  fs.mkdirSync(configDestDir); // eslint-disable-line no-sync
  // Copy the source config file to ./config
  fs.copyFileSync(configSrcFile, configDestFile, fs.constants.COPYFILE_EXCL); // eslint-disable-line no-sync

  // Copy the pre-commit hook into ./git/hooks
  fs.copyFileSync(hookSrcFile, hookDestFile, fs.constants.COPYFILE_EXCL); // eslint-disable-line no-sync
}
catch (e)
{
  console.error(e);
}