#! /usr/bin/env node
"use strict";

// Note that this file is kept deliberately simple as it doesn't go through the babel build process...
// ... and yes, it's all sync and horrible but it's a post-install script so ;-)

const path = require("path");
const fs = require("fs");

const ts = new Date().getTime();

const srcBaseDir = process.cwd();
const destBaseDir = process.env.INIT_CWD || process.cwd(); // process.env.INIT_CWD is intended to allow this script to run on local file: based installs

const configSrcDir = path.join(srcBaseDir, "/config");
const configDestDir = path.join(destBaseDir, "/config");
const configFilename = "git-off-my-land-config.js";
const configSrcFile = path.join(configSrcDir, "/", configFilename);
const configDestFile = path.join(configDestDir, "/", configFilename);
const configDestFileAlt = path.join(configDestDir, "/", `new-${ts}-configFilename`);

const hookSrcDir = path.join(srcBaseDir, "/hooks");
const hookDestDir = path.join(destBaseDir, "/.git/hooks");
const hookFilename = "pre-commit";
const hookSrcFile = path.join(hookSrcDir, "/", hookFilename);
const hookDestFile = path.join(hookDestDir, "/", hookFilename);
const hookDestFileAlt = path.join(hookDestDir, "/", `new-${ts}-hookFilename`);

// TODO: Make this neater
try
{
  fs.mkdirSync(configDestDir); // eslint-disable-line no-sync
}
catch (e)
{
  if(e.code !== "EEXIST") // Don't fail on existing dir
  {
    console.error(e);
  }
}

try
{
  fs.copyFileSync(configSrcFile, configDestFile, fs.constants.COPYFILE_EXCL); // eslint-disable-line no-sync
}
catch (e)
{
  if(e.code === "EEXIST") // Don't overwrite existing file, write to alt file instead
  {
    console.warn(`WARNING! Existing git-off-my-land config file - updated file copied to ${configDestFileAlt}. Please merge your existing config into the new format if it's changed`);
    fs.copyFileSync(configSrcFile, configDestFileAlt, fs.constants.COPYFILE_EXCL); // eslint-disable-line no-sync
  }
  else
  {
    console.error(e);
  }
}

try 
{
    fs.copyFileSync(hookSrcFile, hookDestFile, fs.constants.COPYFILE_EXCL); // eslint-disable-line no-sync
}
catch(e)
{
  if(e.code === "EEXIST") // Don't overwrite existing file, write to alt file instead
  {
    console.warn(`WARNING! Existing git-off-my-land githook file - updated file copied to ${hookDestFileAlt}. Please replace your existing hook file if you have not modified it or merge changes if you have`);
    fs.copyFileSync(hookSrcFile, hookDestFileAlt, fs.constants.COPYFILE_EXCL); // eslint-disable-line no-sync
  }
  else
  {
    console.error(e);
  }
}