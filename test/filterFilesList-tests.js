"use strict";

import {EOL as OSEOL} from "os";
import test from "ava";

import {filterFilesList} from "../src/lib/git-off-my-land-lib.js";

test("Correct operation, valid inputs", async (t) => 
{
    const rawStdOut: string = `A  certs/www.example.com.1.key
A  certs/www.example.com.2.key
D foo/bar.baz
R moo/mar.maz
AD noo/nar.naz
AR ooo/oar.oaz
 M config/git-off-my-land-config.js
 `;
    const ignoreGitStatusResultPrefixes: Array = ["D", "R"];

    let expectedOutput = new Set();
    expectedOutput.add("certs/www.example.com.1.key");
    expectedOutput.add("certs/www.example.com.2.key");
    expectedOutput.add("config/git-off-my-land-config.js");

    const filteredFiles = await filterFilesList(rawStdOut, ignoreGitStatusResultPrefixes, OSEOL);
    
	t.deepEqual(filteredFiles, expectedOutput, "Ensure filteredFiles === expectedOutput");
});


// This fails on "Unhandled Rejection" - needs to be fixed!
test("Error handling, invalid inputs (empty string rawStdOut)", async (t) => 
{
    const rawStdOut: string = ""; // This needs to be a string with no new lines (thus we get no array elements)
    const ignoreGitStatusResultPrefixes: Array = ["D", "R"];

    try
    {
        await filterFilesList(rawStdOut, ignoreGitStatusResultPrefixes, OSEOL); 
    }
    catch(err)
    {
        t.pass(); // We consider this test successful if the function call _does_ throw (reject the promise)
    }

});
