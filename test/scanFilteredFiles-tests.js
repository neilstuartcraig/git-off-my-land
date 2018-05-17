"use strict";

import test from "ava";

import {scanFilteredFiles} from "../src/lib/git-off-my-land-lib.js";

import {fileContentRegexps, violatingFilenameExtensions} from "../config/git-off-my-land-config.js";

test("Correct operation, valid, populated inputs", async (t) => 
{
    // NOTE: See http://fm4dd.com/openssl/certexamples.htm for examples

    let committedFiles = new Set();
    committedFiles.add("test/fixtures/certs/www.example.com.pem");
    committedFiles.add("test/fixtures/certs/www.example.com-wrapped.pem");
    committedFiles.add("test/fixtures/certs/www.example.com.key");
    committedFiles.add("test/fixtures/certs/www.example.com-wrapped.key");
    committedFiles.add("test/fixtures/certs/example-ec-private.key");
    committedFiles.add("test/fixtures/certs/example-ec-private-wrapped.key");
    committedFiles.add("test/fixtures/certs/example.der");
    committedFiles.add("test/fixtures/certs/example.p12");
    committedFiles.add("test/fixtures/AWS/example-aws-access-token.txt");
    committedFiles.add("test/fixtures/AWS/example-aws-access-token-wrapped.txt");
    committedFiles.add("test/fixtures/AWS/example-aws-access-token-ignored.txt");
    committedFiles.add("test/fixtures/AWS/example-aws-access-secret.txt");
    committedFiles.add("test/fixtures/AWS/example-aws-access-secret-wrapped.txt");
    committedFiles.add("test/fixtures/innocuous.txt");
    committedFiles.add("test/fixtures/certs/ignored/example-ec-private--ignored.key");
    committedFiles.add("test/fixtures/certs/ignored/www.example.com--ignored.key");

    const filesToIgnore = 
    [
        /\.gitignore/,
        /config\/git-off-my-land-config.js/,
        /test\/fixtures\/certs\/ignored\/.+/
    ];

    /* eslint-disable */
    const expectedOutput = 
    { 
        "test/fixtures/certs/www.example.com.pem": { content: [ "RSA, DSA or ECC Certificate" ], extension: [ ".pem" ] },
        "test/fixtures/certs/www.example.com-wrapped.pem": { content: [ "RSA, DSA or ECC Certificate" ],extension: [ ".pem" ] },
        "test/fixtures/certs/www.example.com.key": { content: [ "RSA private key" ], extension: [ ".key" ] },
        "test/fixtures/certs/www.example.com-wrapped.key": { content: [ "RSA private key" ], extension: [ ".key" ] },
        "test/fixtures/certs/example-ec-private.key": { content: [ "EC private key" ], extension: [ ".key" ] },
        "test/fixtures/certs/example-ec-private-wrapped.key": { content: [ "EC private key" ], extension: [ ".key" ] },
        "test/fixtures/certs/example.der": { content: [], extension: [ ".der" ] },
        "test/fixtures/certs/example.p12": { content: [], extension: [ ".p12" ] },
        "test/fixtures/AWS/example-aws-access-token.txt": { content: [ "AWS access token" ], extension: [] },
        "test/fixtures/AWS/example-aws-access-token-wrapped.txt": { content: [ "AWS access token" ], extension: [] },
        "test/fixtures/AWS/example-aws-access-token-ignored.txt": { content: [ "AWS access token" ], extension: [] },
        "test/fixtures/AWS/example-aws-access-secret.txt": { content: [ "AWS secret token" ], extension: [] },
        "test/fixtures/AWS/example-aws-access-secret-wrapped.txt": { content: [ "AWS secret token" ], extension: [] } 
    };
    /* eslint-enable */

    const violations = await scanFilteredFiles(committedFiles, fileContentRegexps, violatingFilenameExtensions, filesToIgnore);

    // We'll loop this so we don't need the ordering to be correct
    for(let i in violations)
    {
        t.deepEqual(violations[i], expectedOutput[i], `${i} must match expected`);
    }
});


test("Correct operation, valid, empty inputs", async (t) => 
{
    let committedFiles = new Set();

    const filesToIgnore = [];

    const expectedOutput = [];

    const violations = await scanFilteredFiles(committedFiles, fileContentRegexps, violatingFilenameExtensions, filesToIgnore);
    
	t.deepEqual(violations, expectedOutput, "Ensure filteredFiles === expectedOutput");
});


// This fails on "Unhandled Rejection" - needs to be fixed!
test("Error handling, invalid inputs (files don't exist)", async (t) => 
{
    const committedFiles = new Set();
    committedFiles.add("does/not.exist");

    const filesToIgnore = [];

    try
    {
        await scanFilteredFiles(committedFiles, fileContentRegexps, violatingFilenameExtensions, filesToIgnore);
    }
    catch(e)
    {
        t.pass();
    }
});
