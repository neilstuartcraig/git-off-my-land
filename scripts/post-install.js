#! /usr/bin/env node
"use strict";

// Note that this file is kept deliberately simple as it doesn't go through the babel build process...
// ... and yes, it's all sync and horrible but it's a post-install script so ;-)


console.log(`cwd: ${process.cwd()}`);
console.log(`init cwd: ${process.env.INIT_CWD}`);
// process.exit();


const path = require("path");
const fs = require("fs");

const srcBaseDir = process.cwd();
const destBaseDir = process.env.INIT_CWD;

const configSrcDir = path.join(srcBaseDir, "/config");
const configDestDir = path.join(destBaseDir, "/config");
const configFilename = "git-off-my-land-config.js";

const hookSrcDir = path.join(srcBaseDir, "/hooks");
const hookDestDir = path.join(destBaseDir, "/.git/hooks");
const hookFilename = "pre-commit";


try
{
  fs.mkdirSync(configDestDir);
  fs.copyFileSync(path.join(configSrcDir, "/", configFilename), path.join(configDestDir, "/", configFilename), fs.constants.COPYFILE_EXCL);

  fs.mkdirSync(hookDestDir);
  fs.copyFileSync(path.join(hookSrcDir, "/", hookFilename), path.join(hookDestDir, "/", hookFilename), fs.constants.COPYFILE_EXCL);
}
catch (e)
{
  console.error(e);
}