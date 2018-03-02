"use strict";

var _util = require("util");

var _child_process = require("child_process");

var _os = require("os");

var _fs = require("fs");

var _path = require("path");

// Promisified functions for use in async/await
const exec = (0, _util.promisify)(_child_process.exec);
const readFile = (0, _util.promisify)(_fs.readFile);
const stat = (0, _util.promisify)(_fs.stat);

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
}(); // eslint-disable-line no-undef


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
        const committedFilesArray = rawStdOut.trim().split(EOLChar);

        committedFilesArray.forEach(f => {
            const filenameArray = f.trim().split(" ");

            // Get the filename which is the final element of the array
            const filename = filenameArray.pop();

            // Get the list of git operations (Add, Modify, Delete etc.) which is the final character from 0th element in the array
            const lastOperation = filenameArray[0].split("").pop();

            if (ignoreGitStatusResultPrefixes.includes(lastOperation) === false) {
                committedFilenames.add(filename);
            }
        });
    } catch (e) {
        err = e;
    }

    const p = new Promise((resolve, reject) => {
        if (err) {
            reject(err);
        } else {
            resolve(committedFilenames);
        }
    });

    return p;
}

async function scanFilteredFiles(committedFiles, fileContentRegexps, violatingFilenameExtensions, filesToIgnore) {
    if (!(committedFiles instanceof Set)) {
        throw new TypeError("Value of argument \"committedFiles\" violates contract.\n\nExpected:\nSet\n\nGot:\n" + _inspect(committedFiles));
    }

    if (!Array.isArray(fileContentRegexps)) {
        throw new TypeError("Value of argument \"fileContentRegexps\" violates contract.\n\nExpected:\nArray\n\nGot:\n" + _inspect(fileContentRegexps));
    }

    if (!Array.isArray(violatingFilenameExtensions)) {
        throw new TypeError("Value of argument \"violatingFilenameExtensions\" violates contract.\n\nExpected:\nArray\n\nGot:\n" + _inspect(violatingFilenameExtensions));
    }

    if (!Array.isArray(filesToIgnore)) {
        throw new TypeError("Value of argument \"filesToIgnore\" violates contract.\n\nExpected:\nArray\n\nGot:\n" + _inspect(filesToIgnore));
    }

    let err;
    let filteredViolations = [];

    try {
        let rawViolations = [];
        const committedFilesArray = [...committedFiles];

        // Note: The method for handling async/await in a for loop is from https://blog.lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795
        for (let i in committedFilesArray) {
            const committedFile = committedFilesArray[i];
            const stats = await stat(committedFile);
            if (stats.isFile()) // Check we're not going to try to read a dir because that would bomb
                {
                    if (rawViolations[committedFile] === undefined) {
                        rawViolations[committedFile] = {
                            content: [],
                            extension: []
                        };
                    }

                    // Content-based scanning
                    const content = await readFile(committedFile, "utf8");
                    for (let j in fileContentRegexps) {
                        const pattern = fileContentRegexps[j];

                        if (content.match(pattern.regexp) && filesToIgnore.includes(committedFile) === false) {
                            rawViolations[committedFile]["content"].push(pattern.name);
                            // NOTE: We don't break here because a file may violate > 1 rule
                        }
                    }

                    // Filename extension-based scanning
                    const extension = (0, _path.extname)(committedFile).toLocaleLowerCase();
                    for (let k in violatingFilenameExtensions) {
                        if (violatingFilenameExtensions.includes(extension) === true) {
                            rawViolations[committedFile]["extension"].push(extension);
                            break;
                        }
                    }
                }
        }

        // TODO -> Array.filter() 
        // Prune any empty array items
        let prunedViolations = [];
        for (let violation in rawViolations) {
            const contentLength = rawViolations[violation].content.length;
            const extensionLength = rawViolations[violation].extension.length;
            if (contentLength > 0 || extensionLength > 0) {
                prunedViolations[violation] = rawViolations[violation];
            }
        }

        // TODO -> Array.filter()        
        // Filter for files the user has chosen to ignore
        for (let violation in prunedViolations) {
            let ignore = false;
            for (let i in filesToIgnore) {
                const match = violation.match(filesToIgnore[i]);
                if (match) {
                    ignore = true;
                }
            }

            if (ignore === false) {
                filteredViolations[violation] = prunedViolations[violation];
            }
        }
    } catch (e) {
        err = e;
    }

    const p = new Promise((resolve, reject) => {
        if (err) {
            reject(err);
        } else {
            resolve(filteredViolations);
        }
    });

    return p;
}

// Main handler function. This is the only exported function in the lib
/* istanbul ignore next */
async function runGitHook(config, hookType) {
    if (!(config instanceof Object)) {
        throw new TypeError("Value of argument \"config\" violates contract.\n\nExpected:\nObject\n\nGot:\n" + _inspect(config));
    }

    if (!hookName(hookType)) {
        throw new TypeError("Value of argument \"hookType\" violates contract.\n\nExpected:\nhookName\n\nGot:\n" + _inspect(hookType));
    }

    let err;
    let output;

    // Pre-commit hook handler
    // Note: it may be that the only thing which changes for non pre-commit usage is the cmd to run to get the files
    // Note: It might be worth splitting this out into another function if we add other handlers
    if (hookType === "pre-commit") {
        try {
            const rawFilesList = await exec(config.gitStatusCmd, config.execOptions);

            if (rawFilesList.stderr != "") {
                err = rawFilesList.stderr;
            } else if (rawFilesList.stdout != "") {
                const filteredFiles = await filterFilesList(rawFilesList.stdout, config.ignoreGitStatusResultPrefixes, _os.EOL);

                if (filteredFiles.size > 0) {
                    output = await scanFilteredFiles(filteredFiles, config.fileContentRegexps, config.violatingFilenameExtensions, config.filesToIgnore);
                }
            }
        } catch (e) {
            err = e;
        }
    }

    const p = new Promise((resolve, reject) => {
        // We only reject the promise if there is an actual error...
        // ...we don't reject on finding violating files, that will be handled in the pre-commit script
        if (err) {
console.log("errrrrr");            
            reject(err);
        } else {
console.log(`output: ${output}`);            
            resolve(output);
        }
    });

    return p;
}

// Note: We export all the functions in order to unit test them. Only runGitHook should be used externally
module.exports = {
    filterFilesList: filterFilesList,
    scanFilteredFiles: scanFilteredFiles,
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