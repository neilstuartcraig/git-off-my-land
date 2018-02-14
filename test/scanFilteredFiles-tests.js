"use strict";

import {EOL as OSEOL} from "os";
import test from "ava";

import {scanFilteredFiles} from "../src/lib/git-off-my-land-lib.js";

import {fileContentRegexps} from "../config/git-off-my-land-config-template.js";

test("Correct operation, valid, populated inputs", async (t) => 
{
    let committedFiles = new Set();
    committedFiles.add("test/fixtures/certs/www.example.com.pem");
    committedFiles.add("test/fixtures/certs/www.example.com-wrapped.pem");
    committedFiles.add("test/fixtures/certs/www.example.com.key");
    committedFiles.add("test/fixtures/certs/www.example.com-wrapped.key");
    committedFiles.add("test/fixtures/certs/example-ec-private.key");
    committedFiles.add("test/fixtures/certs/example-ec-private-wrapped.key");
    committedFiles.add("test/fixtures/AWS/example-aws-access-token.txt");
    committedFiles.add("test/fixtures/AWS/example-aws-access-token-wrapped.txt");
    committedFiles.add("test/fixtures/AWS/example-aws-access-token-ignored.txt");
    committedFiles.add("test/fixtures/AWS/example-aws-access-secret.txt");
    committedFiles.add("test/fixtures/AWS/example-aws-access-secret-wrapped.txt");
    committedFiles.add("test/fixtures/innocuous.txt");

    const filesToIgnore = 
    [
        ".gitignore",
        "config/git-off-my-land-config.js",
        "test/fixtures/AWS/example-aws-access-token-ignored.txt"
    ];

    const expectedOutput = 
    [
        "test/fixtures/certs/www.example.com.pem matches rule RSA, DSA or ECC Certificate",
        "test/fixtures/certs/www.example.com-wrapped.pem matches rule RSA, DSA or ECC Certificate",
        "test/fixtures/certs/www.example.com.key matches rule RSA private key",
        "test/fixtures/certs/www.example.com-wrapped.key matches rule RSA private key",
        "test/fixtures/certs/example-ec-private.key matches rule EC private key",
        "test/fixtures/certs/example-ec-private-wrapped.key matches rule EC private key",
        "test/fixtures/AWS/example-aws-access-token.txt matches rule AWS access token",
        "test/fixtures/AWS/example-aws-access-token-wrapped.txt matches rule AWS access token",
        "test/fixtures/AWS/example-aws-access-secret.txt matches rule AWS secret token",
        "test/fixtures/AWS/example-aws-access-secret-wrapped.txt matches rule AWS secret token"
    ];

    const violations = await scanFilteredFiles(committedFiles, fileContentRegexps, filesToIgnore);
    
	t.deepEqual(violations.sort(), expectedOutput.sort(), "Ensure filteredFiles === expectedOutput");
});


test("Correct operation, valid, empty inputs", async (t) => 
{
    let committedFiles = new Set();

    const filesToIgnore = [];

    const expectedOutput = [];

    const violations = await scanFilteredFiles(committedFiles, fileContentRegexps, filesToIgnore);
    
	t.deepEqual(violations, expectedOutput, "Ensure filteredFiles === expectedOutput");
});

/*
// This fails on "Unhandled Rejection" - needs to be fixed!
test("Error handling, invalid inputs (files don't exist)", async (t) => 
{
    const committedFiles = new Set();
    committedFiles.add("does/not.exist");

    const filesToIgnore = [];

    await t.throws(async () => 
    {
        await scanFilteredFiles(committedFiles, fileContentRegexps, filesToIgnore), "Ensure the promise is rejected on error";
    }).catch(() => {});
});
*/