"use strict";

module.exports =
{
    // Array of regular expressions which will be matched against the content of each committed file
    // Each item in the Array must be an object containing 2 key/value pairs: name: <string>, regexp: <regexp>
    "fileContentRegexps":
    [
        {
            "name": "RSA, DSA or ECC Certificate",
            "regexp": /-----BEGIN CERTIFICATE-----.+-----END CERTIFICATE-----/s
        },
        {
            "name": "RSA private key",
            "regexp": /-----BEGIN RSA PRIVATE KEY-----.+-----END RSA PRIVATE KEY-----/s
        },
        {
            "name": "DSA private key",
            "regexp": /-----BEGIN DSA PRIVATE KEY-----.+-----END DSA PRIVATE KEY-----/s
        },
        {
            "name": "EC private key",
            "regexp": /-----BEGIN EC PRIVATE KEY-----.+-----END EC PRIVATE KEY-----/s
        },
        {
            "name": "AWS access token",
            "regexp": /(\s|^)[A-Z0-9]{20}(?![A-Z0-9])(\s|$)/
        },
        {
            "name": "AWS secret token",
            "regexp": /(\s|^)[A-Za-z0-9/+=]{40}(\s|$)/
        }
    ],

    // Array of filename extensions which each committed file will be tested against
    // Ensure that each entry is a lowercase string with a leading .
    "violatingFilenameExtensions":
    [
        ".der",
        ".pem",
        ".crt", 
        ".cer", 
        ".p12",        
        ".pfx",        
        ".key"
    ],

    // The command which will be run to obtain a list of committed files
    "gitStatusCmd": "git status --porcelain",

    // Git statuses to ignore (we don't care if you have deleted (D) a file so we will ignore that)
    "ignoreGitStatusResultPrefixes": ["D"],

    // The command which will be used to list all git-controlled files in the repo
    "gitAllFilesCmd": "git ls-files",

    // An Array of files to ignore
    // Each entry must be a string, a relative (to the repo root) path to the file, including the filename extension
    "filesToIgnore": 
    [
        /\.gitignore/, // Note: We need to ignore the .gitignore file because it may contain filenames which violate rules and those files won't be in the commit
        /config\/git-off-my-land-config.js/,
        /node_modules\/git-off-my-land\/config\/git-off-my-land-config.js/,
        /node_modules\/git-off-my-land\/test\/fixtures\/.*/ // Note: This ignores test fixtures in installations of GOML
    ],

    // The header for the output when violating file(s) are detected
    // This must be a string
    "violationsMessageHeader": "*** Git Off My Land detected the following violations ***",

    // The footerer for the output when violating file(s) are detected
    // This must be a string
    "violationsMessageFooter": "*** If you are sure some of the above files are OK to be committed, add them to config/git-off-my-land-config.js in the 'filesToIgnore' Array then commit again ***",

    // An Object containing exec options
    // See https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
    "execOptions":
    {
        cwd: process.cwd(),
        windowsHide: true,
        timeout: 10
    }
};