#! /usr/bin/env node

"use strict";

// Note that this file is kept deliberately simple as it doesn't go through the babel build process...
// ... and yes, it's all sync and horrible but it's a post-install script so ;-)

const path = require("path");
const fs = require("fs");

const ts = new Date().getTime();

const srcBaseDir = process.cwd();
// NOTE:
// process.env.INIT_CWD is intended to allow this script to run on local file: based installs but, it only works on modern node versions
// On node 6 (at least), process.cwd() is node the location from which `npm install` is run, it's the installation dir of this node module i.e. <pwd>/node_modules/git-off-my-land/
// Unsure why this isn't the case for srcBaseDir, above...
let destBaseDir = process.env.INIT_CWD || process.cwd();

// "fix" node 6-like behaviour to get the correct dir name (strip "node_modules/git-off-my-land" from the end)
const destBaseDirArr = destBaseDir.split("/");
if (destBaseDirArr.pop() === "git-off-my-land" && destBaseDirArr.pop() === "node_modules") {
  destBaseDir = destBaseDirArr.join("/");
}

const configSrcDir = path.join(srcBaseDir, "/config");
const configDestDir = path.join(destBaseDir, "/config");
const configFilename = "git-off-my-land-config.js";
const configSrcFile = path.join(configSrcDir, "/", configFilename);
const configDestFile = path.join(configDestDir, "/", configFilename);
const configDestFileAlt = path.join(configDestDir, "/", `${ts}-${configFilename}`);

const hookSrcDir = path.join(srcBaseDir, "/hooks");
const hookDestDir = path.join(destBaseDir, "/.git/hooks");
const hookFilename = "pre-commit";
const hookSrcFile = path.join(hookSrcDir, "/", hookFilename);
const hookDestFile = path.join(hookDestDir, "/", hookFilename);
const hookDestFileAlt = path.join(hookDestDir, "/", `${hookFilename}-${ts}`);

/* eslint-disable no-sync */
const hookFile = fs.readFileSync(hookSrcFile);
const hookFileOptions = {
  mode: 0o755
};

try {
  fs.statSync(hookDestDir);

  try {
    fs.statSync(hookDestFile);

    // If we get here, the dest file exists so we want to write to the alt location
    console.warn(`WARNING! Existing git-off-my-land githook file - updated file copied to ${hookDestFileAlt}. Please replace your existing hook file if you have not modified it or merge changes if you have`);
    fs.writeFileSync(hookDestFileAlt, hookFile, hookFileOptions);
  } catch (e) {
    if (e.code === "ENOENT") {
      fs.writeFileSync(hookDestFile, hookFile, hookFileOptions);
    } else {
      console.error(e);
    }
  }
} catch (e) {
  console.error("Error: It looks like this is not a git-controlled project. Please run 'git init' then try the install again");
  process.exit(1);
}

try {
  fs.mkdirSync(configDestDir);
} catch (e) {
  if (e.code !== "EEXIST") // Don't fail on existing dir
    {
      console.error(e);
    }
}

const confFile = fs.readFileSync(configSrcFile);

try {

  fs.statSync(configDestFile);

  // If we get here, the dest file exists so we want to write to the alt location
  console.warn(`WARNING! Existing git-off-my-land config file - updated file copied to ${configDestFileAlt}. Please merge your existing config into the new format if it's changed`);
  fs.writeFileSync(configDestFileAlt, confFile);
} catch (e) {
  if (e.code === "ENOENT") {
    fs.writeFileSync(configDestFile, confFile);
  } else {
    console.error(e);
  }
}
/* enable-eslint */