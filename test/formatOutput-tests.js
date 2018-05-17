"use strict";

import {EOL} from "os";
import test from "ava";

import {formatOutput} from "../src/lib/git-off-my-land-lib.js";

test("Correct operation, valid, populated inputs, unsorted -> sorted", async (t) => 
{
    const header = "header";
    const footer = "footer";

    const violations = 
    {
        "zzz-key.blah": 
        {
            "content": 
            [
                "key"
            ], 
            extension: 
            [
            ]
        },
        "aaa-file.pem": 
        {
            "content": 
            [
                "pem"
            ], 
            extension: 
            [ 
                ".pem"
            ]
        },
        "mmm-file.token": 
        {
            "content": 
            [
            ], 
            extension: 
            [ 
                ".token"
            ]
        }
    };

    const expectedViolations = 
    [
        "aaa-file.pem - Content: pem. Filename extension: .pem",
        "mmm-file.token - Content: none. Filename extension: .token",
        "zzz-key.blah - Content: key. Filename extension: none"
    ];

    const expectedOutput = [header, ...expectedViolations, footer].join(EOL);

    const output = await formatOutput(header, violations, footer);

    t.is(output, expectedOutput, "Ensure output is in the expected format and order");    
});

test("Correct operation, valid, populated inputs, unsorted -> sorted, multiline header and footer", async (t) => 
{
    const header = "header" + EOL + "next";
    const footer = "footer" + EOL + "final";

    const violations = 
    {
        "zzz-key.blah": 
        {
            "content": 
            [
                "key"
            ], 
            extension: 
            [
            ]
        },
        "aaa-file.pem": 
        {
            "content": 
            [
                "pem"
            ], 
            extension: 
            [ 
                ".pem"
            ]
        },
        "mmm-file.token": 
        {
            "content": 
            [
            ], 
            extension: 
            [ 
                ".token"
            ]
        }
    };

    const expectedViolations = 
    [
        "aaa-file.pem - Content: pem. Filename extension: .pem",
        "mmm-file.token - Content: none. Filename extension: .token",
        "zzz-key.blah - Content: key. Filename extension: none"
    ];

    const expectedOutput = [header, ...expectedViolations, footer].join(EOL);

    const output = await formatOutput(header, violations, footer);

    t.is(output, expectedOutput, "Ensure output is in the expected format and order");    
});

test("Correct operation, empty violations object", async (t) => 
{
    const header = "header";
    const footer = "footer";

    const violations = {}; //eslint-disable-line object-curly-newline

    const expectedOutput = "";

    const output = await formatOutput(header, violations, footer);

    t.is(output, expectedOutput, "Ensure we get an empty string");
    t.is(typeof output === "string", true, "Ensure we get a string");
});




test("Correct operation, null violations object", async (t) => 
{
    const header = "header";
    const footer = "footer";

    const violations = null; //eslint-disable-line object-curly-newline

    const expectedOutput = "";

    const output = await formatOutput(header, violations, footer);

    t.is(output, expectedOutput, "Ensure we get an empty string");
    t.is(typeof output === "string", true, "Ensure we get a string");
});




test("Error handling, invalid inputs (files don't exist)", async (t) => 
{
    const header = "header";
    const footer = "footer";

    const violations = 
    {
        a: 1,
        b: 2
    };

    try
    {
        await formatOutput(header, violations, footer);
    }
    catch(e)
    {
        t.pass("Must throw an error/reject the promise");
    }
});