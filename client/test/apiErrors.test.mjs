import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import ts from "../node_modules/typescript/lib/typescript.js";
import vm from "node:vm";

const errorsModulePath = join(import.meta.dirname, "../src/api/errors.ts");

function loadErrorsModule() {
    const source = readFileSync(errorsModulePath, "utf8");
    const { outputText } = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2020,
        },
    });
    const exports = {};
    const context = {
        exports,
        module: { exports },
        Response,
        Headers,
        TypeError,
    };
    vm.runInNewContext(outputText, context);
    return context.module.exports;
}

test("API error parser joins validation messages from errors array", async () => {
    const { getResponseErrorMessage } = loadErrorsModule();
    const response = Response.json(
        {
            errors: [
                { field: "name", message: "Community name cannot be empty" },
                { field: "tags", message: "Please select at least one tag" },
            ],
        },
        { status: 400 },
    );

    assert.equal(
        await getResponseErrorMessage(response, "Could not create community"),
        "Community name cannot be empty\nPlease select at least one tag",
    );
});

test("API error parser uses specific JSON message", async () => {
    const { getResponseErrorMessage } = loadErrorsModule();
    const response = Response.json(
        { message: "Community name already taken" },
        { status: 400 },
    );

    assert.equal(
        await getResponseErrorMessage(response, "Could not create community"),
        "Community name already taken",
    );
});

test("API error parser replaces generic server messages with fallback", async () => {
    const { getResponseErrorMessage } = loadErrorsModule();
    const response = new Response("Internal Server Error", { status: 500 });

    assert.equal(
        await getResponseErrorMessage(response, "Could not create community"),
        "Could not create community",
    );
});

test("API error parser uses specific text response", async () => {
    const { getResponseErrorMessage } = loadErrorsModule();
    const response = new Response("Community name already taken", {
        status: 400,
    });

    assert.equal(
        await getResponseErrorMessage(response, "Could not create community"),
        "Community name already taken",
    );
});

test("request failure message explains network failure", () => {
    const { getRequestFailureMessage } = loadErrorsModule();

    assert.equal(
        getRequestFailureMessage("create community", new TypeError("fetch failed")),
        "Could not create community because the server could not be reached. Check your connection and try again.",
    );
});
