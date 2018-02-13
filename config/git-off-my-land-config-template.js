"use strict";

module.exports =
{
    "fileContentRegexps":
    [
        {
            "name": "RSA PUBLIC key",
            "regexp": /-----BEGIN RSA CERTIFICATE-----.+-----END RSA CERTIFICATE-----/s
        },
        {
            "name": "RSA private key",
            "regexp": /-----BEGIN RSA PRIVATE KEY-----.+-----END RSA PRIVATE KEY-----/s
        },
        {
            "name": "DSA public key",
            "regexp": /-----BEGIN DSA CERTIFICATE-----.+-----END DSA CERTIFICATE-----/s
        },
        {
            "name": "DSA private key",
            "regexp": /-----BEGIN DSA PRIVATE KEY-----.+-----END DSA PRIVATE KEY-----/s
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
    "gitStatusCmd": "git status --porcelain",
    "ignoreGitStatusResultPrefixes": ["D", "R"],
    "gitAllFilesCmd": "git ls-files",
    "filesToIgnore": 
    [
        ".gitignore",
        "config/git-off-my-land-config.js"
    ],
    "violationsMessageHeader": "*** Git Off My Land detected the following violations ***",
    "violationsMessageFooter": "*** If you are sure some of the above files are OK to be committed, add them to config/git-off-my-land-config.js in the 'filesToIgnore' Array then commit again ***",
    "execOptions":
    {
        cwd: process.cwd(),
        windowsHide: true,
        timeout: 10
    }
};