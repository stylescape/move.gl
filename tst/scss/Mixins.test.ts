// @vitest-environment node
import { resolve } from 'node:path';
import { compileString } from 'sass';
import { describe, expect, it } from 'vitest';

const loadPaths = [resolve(__dirname, '../../src/scss')];

function compile(body: string): string {
    return compileString(`@use "mixins" as *;\n${body}`, { loadPaths }).css;
}

function keyframeNames(css: string): string[] {
    return [...css.matchAll(/@keyframes ([\w-]+)/g)].map((m) => m[1]);
}

describe('animate_* $name parameter', () => {
    it('keeps the default keyframes name', () => {
        const css = compile('.a { @include animate_shake; }');
        expect(css).toContain('animation-name: animate_shake;');
        expect(keyframeNames(css)).toContain('animate_shake');
    });

    it('gives each parameter set its own keyframes', () => {
        const css = compile(`
            .a { @include animate_shake(5deg, $name: shake_small); }
            .b { @include animate_shake(20deg, $name: shake_large); }
        `);
        expect(css).toContain('animation-name: shake_small;');
        expect(css).toContain('animation-name: shake_large;');
        expect(keyframeNames(css)).toEqual(expect.arrayContaining(['shake_small', 'shake_large']));
        expect(css).not.toContain('@keyframes animate_shake');
    });

    it('covers inline keyframes and wrapper mixins', () => {
        const css = compile(`
            .a { @include animate_heartbeat($name: beat_a); }
            .b { @include animate_hinge_left($name: hinge_a); }
        `);
        expect(keyframeNames(css)).toEqual(expect.arrayContaining(['beat_a', 'hinge_a']));
        expect(css).toContain('animation-name: hinge_a;');
    });
});

describe('filter_hover', () => {
    it('takes the hover filter first', () => {
        const css = compile('.a { @include filter_hover(grayscale(1)); }');
        expect(css).toMatch(/\.a \{\s*filter: none;/);
        expect(css).toMatch(/\.a:hover \{\s*filter: grayscale\(1\);/);
    });
});
