"use strict";

// Core deps
const util = require("util");
const childProcess = require("child_process");
const os = require("os");
const fs = require("fs");

// Promisified functions
const exec = util.promisify(childProcess.exec);
const readFile = util.promisify(fs.readFile);
const stat = util.promisify(fs.stat);

// TODO: Move this to config so it's not awkwardly hardcoded?
// Config
const execOptions = 
{
    cwd: process.cwd(),
    windowsHide: true
};

// Flow type definitions etc.
// @flow
type hookName = "pre-commit"; // | "pre-push"; 



// Filter committed filename list (from e.g. git status --porcelain)
async function filterFilesList(rawStdOut: string, ignoreGitStatusResultPrefixes: Array, EOLChar: string)
{
    let err;
    let committedFilenames = new Set();

    try 
    {
        // Trim whitespace from the start & end, split on new line (OS-independent style)
        const committedFilesArray = rawStdOut.trim().split(EOLChar);

        // Iterate through the comitted files list and...
        committedFilesArray.forEach((f) => 
        {
            // Split the trimmed line on the first space, this results in:
            const filenameArray = f.trim().split(" ");

            // The last element in the array being the filename - and...
            const filename = filenameArray.pop();

            // The 0th element in the array being the list of git operations (Add, Modify, Delete etc.), we only want the last operation
            const lastOperation = filenameArray[0].split("").pop();

            // Remove files whose operation type we're not interested in
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

    // We'll return a Promise, so...
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
    // Default error
    let err;

    // Create a Set that we'll output
    let violations = [];

    try
    {
    // https://blog.lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795 suggests:    
        const committedFilesArray = [...committedFiles];
        for(let i in committedFilesArray)
        {
            const committedFile = committedFilesArray[i];

            const stats = await stat(committedFile);

            if(stats.isFile()) // Check we're not going to try to read a dir
            {
                const content = await readFile(committedFile, "utf8");  

                // Test the file content versus defined regexp rules
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

    // We'll return a Promise, so...
    const p = new Promise((resolve, reject) => 
    {
        // TODO: try/catch above and use the status here
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
    // Default return values
    let err;
    let output;

    // Pre-commit hook handler
    // Note: it may be that the only thing which changes for non pre-commit usage is the cmd to run to get the files
    // Note: It might be worth splitting this out into another function if we add other handlers
    if(hookType === "pre-commit")
    {
        try
        {
            const rawFilesList = await exec(config.gitStatusCmd, execOptions);

            // If the status check was successful...
            if(rawFilesList.stderr === "")
            {
                const filteredFiles = await filterFilesList(rawFilesList.stdout, config.ignoreGitStatusResultPrefixes, os.EOL);

                // Check we've got some files to scan...
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
    
    // We will return a Promise, so...
    const p = new Promise((resolve, reject) => 
    {
        // We only reject the promise if there is an actual error, we don't reject on finding violating files  
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
