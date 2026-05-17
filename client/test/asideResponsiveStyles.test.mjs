import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import * as sass from "sass";

const asideStylesPath = join(
    import.meta.dirname,
    "../src/components/Aside/Aside.module.scss",
);

test("sidebar icons keep their width when labels are hidden on narrow screens", () => {
    const source = readFileSync(asideStylesPath, "utf8");
    const css = sass.compileString(source, { style: "expanded" }).css;

    assert.match(
        css,
        /\.aside \.element > img,\s*\.aside \.element > svg \{[^}]*flex-shrink: 0;/s,
    );
});
