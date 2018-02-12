"use strict";

/*

Architecture:

runGitHook() - called by e.g. pre-commit file
    - calls functions for each hook type which use:
        - local lib functions (not exported)

Consider:
    How to filter any user input we take to avoid vulnerabilities

*/

// Deps

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
const execOptions = {
    cwd: process.cwd(),
    windowsHide: true
};

// Flow type definitions etc.

const hookName = function () {
    function hookName(input) {
        return input === "pre-commit";
    }

    ;
    Object.defineProperty(hookName, Symbol.hasInstance, {
        value: function (input) {
            return hookName(input);
        }
    });
    return hookName;
}(); // | "pre-push"; 


// Local functions

// Filter committed filename list (from e.g. git status --porcelain)
/*
    Example argument values:
    
    rawStdOut:
     M .gitignore
     M certs/www.example.com.key

    ignoreGitStatusResultPrefixes:
    ["D", "R"]

    EOLChar:
    "\n"
*/


async function filterFilesList(rawStdOut, ignoreGitStatusResultPrefixes, EOLChar) {
    if (!(typeof rawStdOut === 'string')) {
        throw new TypeError("Value of argument \"rawStdOut\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(rawStdOut));
    }

    if (!Array.isArray(ignoreGitStatusResultPrefixes)) {
        throw new TypeError("Value of argument \"ignoreGitStatusResultPrefixes\" violates contract.\n\nExpected:\nArray\n\nGot:\n" + _inspect(ignoreGitStatusResultPrefixes));
    }

    if (!(typeof EOLChar === 'string')) {
        throw new TypeError("Value of argument \"EOLChar\" violates contract.\n\nExpected:\nstring\n\nGot:\n" + _inspect(EOLChar));
    }

    let err;

    let committedFilenames = new Set();

    try {
        // Trim whitespace from the start & end, split on new line (OS-independent style)
        const committedFilesArray = rawStdOut.trim().split(EOLChar);

        // Iterate through the comitted files list and...
        committedFilesArray.forEach(f => {
            // Split the trimmed line on the first space, this results in:
            const filenameArray = f.trim().split(" ");

            // The last element in the array being the filename - and...
            const filename = filenameArray.pop();

            // The 0th element in the array being the list of git operations (Add, Modify, Delete etc.), we only want the last operation
            const lastOperation = filenameArray[0].split("").pop();

            // Remove files whose operation type we're not interested in
            if (ignoreGitStatusResultPrefixes.includes(lastOperation) === false) {
                committedFilenames.add(filename);
            }
        });
    } catch (e) {
        err = e;
    }

    // We'll return a Promise, so...
    const p = new Promise((resolve, reject) => {
        // TODO: try/catch above and use the status here
        if (err) {
            reject(err);
        } else {
            resolve(committedFilenames);
        }
    });

    return p;
}

async function scanFilteredFiles(committedFiles, fileContentRegexps, filesToIgnore) {
    if (!(committedFiles instanceof Set)) {
        throw new TypeError("Value of argument \"committedFiles\" violates contract.\n\nExpected:\nSet\n\nGot:\n" + _inspect(committedFiles));
    }

    if (!Array.isArray(fileContentRegexps)) {
        throw new TypeError("Value of argument \"fileContentRegexps\" violates contract.\n\nExpected:\nArray\n\nGot:\n" + _inspect(fileContentRegexps));
    }

    if (!Array.isArray(filesToIgnore)) {
        throw new TypeError("Value of argument \"filesToIgnore\" violates contract.\n\nExpected:\nArray\n\nGot:\n" + _inspect(filesToIgnore));
    }

    // Default error
    let err;

    // Create a Set that we'll output
    let violations = [];

    try {
        // https://blog.lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795 suggests:    
        const committedFilesArray = [...committedFiles];
        for (let i in committedFilesArray) {
            const committedFile = committedFilesArray[i];

            const stats = await stat(committedFile);

            if (stats.isFile()) // Check we're not going to try to read a dir
                {
                    const content = await readFile(committedFile, "utf8");

                    // Test the file content versus defined regexp rules
                    for (let j in fileContentRegexps) {
                        const pattern = fileContentRegexps[j];

                        if (content.match(pattern.regexp) && filesToIgnore.includes(committedFile) === false) {
                            violations.push(`${committedFile} matches rule ${pattern.name}`);
                            break;
                        }
                    }
                }
        }
    } catch (e) {
        err = e;
    }

    // We'll return a Promise, so...
    const p = new Promise((resolve, reject) => {
        // TODO: try/catch above and use the status here
        if (err) {
            reject(err);
        } else {
            resolve(violations);
        }
    });

    return p;
}

// Main handler function. This is the only exported function in the lib
async function runGitHook(config, hookType) {
    if (!(config instanceof Object)) {
        throw new TypeError("Value of argument \"config\" violates contract.\n\nExpected:\nObject\n\nGot:\n" + _inspect(config));
    }

    if (!hookName(hookType)) {
        throw new TypeError("Value of argument \"hookType\" violates contract.\n\nExpected:\nhookName\n\nGot:\n" + _inspect(hookType));
    }

    // Default return values
    let err;
    let output;

    // Pre-commit hook handler
    // Note: it may be that the only thing which changes for non pre-commit usage is the cmd to run to get the files
    // Note: It might be worth splitting this out into another function if we add other handlers
    if (hookType === "pre-commit") {
        try {
            const rawFilesList = await exec(config.gitStatusCmd, execOptions);

            // If the status check was successful...
            if (rawFilesList.stderr === "") {
                const filteredFiles = await filterFilesList(rawFilesList.stdout, config.ignoreGitStatusResultPrefixes, os.EOL);

                // Check we've got some files to scan...
                if (filteredFiles.size > 0) {
                    output = await scanFilteredFiles(filteredFiles, config.fileContentRegexps, config.filesToIgnore);
                }
            } else {
                err = rawFilesList.stderr;
            }
        } catch (e) {
            err = e;
        }
    }

    // We will return a Promise, so...
    const p = new Promise((resolve, reject) => {
        // We only reject the promise if there is an actual error, we don't reject on finding violating files  
        if (err) {
            reject(err);
        } else {
            resolve(output);
        }
    });

    return p;
}

module.exports = {
    runGitHook: runGitHook
};

function _inspect(input, depth) {
    const maxDepth = 4;
    const maxKeys = 15;

    if (depth === undefined) {
        depth = 0;
    }

    depth += 1;

    if (input === null) {
        return 'null';
    } else if (input === undefined) {
        return 'void';
    } else if (typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
        return typeof input;
    } else if (Array.isArray(input)) {
        if (input.length > 0) {
            if (depth > maxDepth) return '[...]';

            const first = _inspect(input[0], depth);

            if (input.every(item => _inspect(item, depth) === first)) {
                return first.trim() + '[]';
            } else {
                return '[' + input.slice(0, maxKeys).map(item => _inspect(item, depth)).join(', ') + (input.length >= maxKeys ? ', ...' : '') + ']';
            }
        } else {
            return 'Array';
        }
    } else {
        const keys = Object.keys(input);

        if (!keys.length) {
            if (input.constructor && input.constructor.name && input.constructor.name !== 'Object') {
                return input.constructor.name;
            } else {
                return 'Object';
            }
        }

        if (depth > maxDepth) return '{...}';
        const indent = '  '.repeat(depth - 1);
        let entries = keys.slice(0, maxKeys).map(key => {
            return (/^([A-Z_$][A-Z0-9_$]*)$/i.test(key) ? key : JSON.stringify(key)) + ': ' + _inspect(input[key], depth) + ';';
        }).join('\n  ' + indent);

        if (keys.length >= maxKeys) {
            entries += '\n  ' + indent + '...';
        }

        if (input.constructor && input.constructor.name && input.constructor.name !== 'Object') {
            return input.constructor.name + ' {\n  ' + indent + entries + '\n' + indent + '}';
        } else {
            return '{\n  ' + indent + entries + '\n' + indent + '}';
        }
    }
}