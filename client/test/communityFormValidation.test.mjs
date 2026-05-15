import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import ts from "../node_modules/typescript/lib/typescript.js";
import vm from "node:vm";

const validationModulePath = join(
    import.meta.dirname,
    "../src/components/Communities/CreateCommunity/communityFormValidation.ts",
);

function loadValidationModule() {
    const source = readFileSync(validationModulePath, "utf8");
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
    };
    vm.runInNewContext(outputText, context);
    return context.module.exports;
}

test("community form validation matches API name constraints", () => {
    const { getCommunityNameError } = loadValidationModule();

    assert.equal(
        getCommunityNameError("C"),
        "Community name must be at least 3 characters long",
    );
    assert.equal(
        getCommunityNameError("CS"),
        "Community name must be at least 3 characters long",
    );
    assert.equal(getCommunityNameError("Computer Science"), "");
    assert.equal(
        getCommunityNameError("a".repeat(33)),
        "Community name must be at most 32 characters long",
    );
});

test("community form validation requires a description before upload", () => {
    const { getCommunityDescriptionError } = loadValidationModule();

    assert.equal(
        getCommunityDescriptionError(""),
        "Community description cannot be empty",
    );
    assert.equal(
        getCommunityDescriptionError("   "),
        "Community description cannot be empty",
    );
    assert.equal(getCommunityDescriptionError("A valid description"), "");
    assert.equal(
        getCommunityDescriptionError("a".repeat(1025)),
        "Community description must be at most 1024 characters long",
    );
});
