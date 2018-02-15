#! /usr/bin/env node
"use strict";

// Note that this file is kept deliberately simple as it doesn't go through the babel build process...
// ... and yes, it's all sync and horrible but it's a post-install script so ;-)


console.log(`cwd: ${process.cwd()}`);
console.log(`init cwd: ${process.env.INIT_CWD}`);
// process.exit();


const path = require("path");
const fs = require("fs");

const configDir = "config"; // Relative to destination repo root
const configTemplateFilename = "git-off-my-land-config-template.js";
const configDestinationFilename = "git-off-my-land-config.js";

const hookDir = "hooks"; // Relative to destination repo root
const hookTemplateFilename = "pre-commit";
const hookDestinationFilename = "pre-commit";

const cwd = process.env.INIT_CWD; // process.env.INIT_CWD is correct with npm install <pkg name>

const src = 
[
  path.join("./", configDir, "/", configTemplateFilename).replace(" ", "\ "),
  path.join("./", hookDir, "/", hookTemplateFilename).replace(" ", "\ ")
];

const dest = 
[
  path.join(cwd, "/", configDir, "/", configDestinationFilename),
  path.join(cwd, "/.git/", hookDir, "/", hookDestinationFilename)
];

console.dir(src);
console.dir(dest);


for(let i in src)
{
  let sourceFile = src[i];
  let destFile = dest[i];

  // Read the source file
  fs.readFile(sourceFile, (readsourceFileErr, readsourceFileData) =>
  {
    if(readsourceFileErr)
    {
      throw readsourceFileErr;
    }

    // Append the contents of the source file to the destination file - this is OK because we already checked that the destination file doesn't exist, so this will just create it
    fs.appendFile(destFile, readsourceFileData, {flag: "ax"}, (appendErr) =>
    {
      if(appendErr)
      {
        if(appendErr.code === "EEXIST")
        {
          console.log("Config file " + destFile + " exists, will not overwrite it");
          process.exit(0);
        }
        else
        {
          throw appendErr;
        }
      }

      console.log("Copied config file to " + destFile + " - please amend it with your details before running the app");
    });
  });
}
