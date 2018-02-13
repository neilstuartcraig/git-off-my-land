"use strict";

const util = require("util");
const childProcess = require("child_process");
const os = require("os");
const fs = require("fs");

// Promisified functions for use in async/await
const exec = util.promisify(childProcess.exec);
const readFile = util.promisify(fs.readFile);
const stat = util.promisify(fs.stat);

// Flow type definitions etc.
// @flow
type hookName = "pre-commit"; // | "pre-push"; 


async function filterFilesList(rawStdOut: string, ignoreGitStatusResultPrefixes: Array, EOLChar: string)
{
    let err;
    let committedFilenames = new Set();

    try 
    {
        const committedFilesArray = rawStdOut.trim().split(EOLChar);

        committedFilesArray.forEach((f) => 
        {
            const filenameArray = f.trim().split(" ");

            // Get the filename which is the final element of the array
            const filename = filenameArray.pop();

            // Get the list of git operations (Add, Modify, Delete etc.) which is the final character from 0th element in the array
            const lastOperation = filenameArray[0].split("").pop();

            if(ignoreGitStatusResultPrefixes.includes(lastOperation) === false)
            {
                committedFilenames.add(filename);
            }
        });
    }
    catch(e)
    {
        err = e;
    }

    const p = new Promise((resolve, reject) => 
    {
        if(err)
        {
            reject(err);
        }
        else
        {
            resolve(committedFilenames);
        }
    });

    return p;
}


async function scanFilteredFiles(committedFiles: Set, fileContentRegexps: Array, filesToIgnore: Array)
{
    let err;
    let violations = [];

    try
    {
        const committedFilesArray = [...committedFiles];

        // Note: The method for handling async/await in a for loop is from https://blog.lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795
        for(let i in committedFilesArray)
        {
            const committedFile = committedFilesArray[i];

            const stats = await stat(committedFile);

            if(stats.isFile()) // Check we're not going to try to read a dir as that would bomb
            {
                const content = await readFile(committedFile, "utf8");  

                for(let j in fileContentRegexps)
                {
                    const pattern = fileContentRegexps[j];
        
                    if(content.match(pattern.regexp) && filesToIgnore.includes(committedFile) === false)
                    {
                        violations.push(`${committedFile} matches rule ${pattern.name}`);
                        break;
                    }
                }
            }
        }
    }
    catch(e)
    {
        err = e;
    }

    const p = new Promise((resolve, reject) => 
    {
        if(err)
        {
            reject(err);
        }
        else
        {
            resolve(violations);
        }

    });

    return p;    
}

// Main handler function. This is the only exported function in the lib
async function runGitHook(config: Object, hookType: hookName)
{
    let err;
    let output;

    // Pre-commit hook handler
    // Note: it may be that the only thing which changes for non pre-commit usage is the cmd to run to get the files
    // Note: It might be worth splitting this out into another function if we add other handlers
    if(hookType === "pre-commit")
    {
        try
        {
            const rawFilesList = await exec(config.gitStatusCmd, config.execOptions);

            if(rawFilesList.stderr === "")
            {
                const filteredFiles = await filterFilesList(rawFilesList.stdout, config.ignoreGitStatusResultPrefixes, os.EOL);

                if(filteredFiles.size > 0)
                {
                    output = await scanFilteredFiles(filteredFiles, config.fileContentRegexps, config.filesToIgnore);
                }
            }
            else
            {
                err = rawFilesList.stderr;
            }
        }
        catch(e)
        {
            err = e;
        }
    }
    
    const p = new Promise((resolve, reject) => 
    {
        // We only reject the promise if there is an actual error...
        // ...we don't reject on finding violating files, that will be handled in the pre-commit script
        if(err)
        {
            reject(err);
        }
        else
        {
            resolve(output);
        }
    });

    return p;
}

module.exports =
{
    runGitHook: runGitHook
};
