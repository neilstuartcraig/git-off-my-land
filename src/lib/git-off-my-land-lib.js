"use strict";

import {promisify} from "util";
import {exec as cpexec} from "child_process";
import {EOL} from "os";
import {readFile as FSRReadFile, stat as FSStat} from "fs";
import {extname} from "path";

// Promisified functions for use in async/await
const exec = promisify(cpexec);
const readFile = promisify(FSRReadFile);
const stat = promisify(FSStat);

// Flow type definitions etc.
// @flow
type hookName = "pre-commit"; // eslint-disable-line no-undef


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


async function scanFilteredFiles(committedFiles: Set, fileContentRegexps: Array, violatingFilenameExtensions: Array, filesToIgnore: Array)
{
    let err;    
    let filteredViolations = [];  

    try
    {
        let rawViolations = [];
        const committedFilesArray = [...committedFiles];

        // Note: The method for handling async/await in a for loop is from https://blog.lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795
        for(let i in committedFilesArray)
        {
            const committedFile = committedFilesArray[i];
            const stats = await stat(committedFile);
            if(stats.isFile()) // Check we're not going to try to read a dir because that would bomb
            {
                if(rawViolations[committedFile] === undefined)
                {
                    rawViolations[committedFile] = 
                    {
                        content: [],
                        extension: []
                    };
                }

                // Content-based scanning
                const content = await readFile(committedFile, "utf8");  
                for(let j in fileContentRegexps)
                {
                    const pattern = fileContentRegexps[j];
                            
                    if(content.match(pattern.regexp) && filesToIgnore.includes(committedFile) === false)
                    {
                        rawViolations[committedFile]["content"].push(pattern.name);
                        // NOTE: We don't break here because a file may violate > 1 rule
                    }
                }

                // Filename extension-based scanning
                const extension = extname(committedFile).toLocaleLowerCase();
                for(let k in violatingFilenameExtensions)
                {
                    if(violatingFilenameExtensions.includes(extension) === true)
                    {
                        rawViolations[committedFile]["extension"].push(extension);
                        break;
                    }
                }
            }
        }

// TODO -> Array.filter() 
        // Prune any empty array items
        let prunedViolations = [];
        for(let violation in rawViolations)
        {
            const contentLength = rawViolations[violation].content.length;
            const extensionLength = rawViolations[violation].extension.length;
            if(contentLength > 0 || extensionLength > 0)
            {
                prunedViolations[violation] = rawViolations[violation];
            }
        }

// TODO -> Array.filter()        
        // Filter for files the user has chosen to ignore
        for(let violation in prunedViolations)
        {
            let ignore = false;
            for(let i in filesToIgnore)
            {
                const match = violation.match(filesToIgnore[i]);         
                if(match)
                {
                    ignore = true;
                }
            }
            
            if(ignore === false)
            {
                filteredViolations[violation] = prunedViolations[violation];
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
            resolve(filteredViolations);
        }

    });

    return p;    
}

// Main handler function. This is the only exported function in the lib
/* istanbul ignore next */
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

            if(rawFilesList.stderr.length > 0)
            {
                err = rawFilesList.stderr;
            }
            else if(rawFilesList.stdout.length > 0)
            {
                const filteredFiles = await filterFilesList(rawFilesList.stdout, config.ignoreGitStatusResultPrefixes, EOL);

                if(filteredFiles.size > 0)
                {
                    output = await scanFilteredFiles(filteredFiles, config.fileContentRegexps, config.violatingFilenameExtensions, config.filesToIgnore);
                }
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

// Note: We export all the functions in order to unit test them. Only runGitHook should be used externally
module.exports =
{
    filterFilesList: filterFilesList,
    scanFilteredFiles:scanFilteredFiles,
    runGitHook: runGitHook
};
