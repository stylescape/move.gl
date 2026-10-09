import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { VirtualKeyboard } from '../../src/ts/Keyboard';

describe('VirtualKeyboard', () => {
    let input: HTMLInputElement;
    let keyboard: VirtualKeyboard;
    let pressed: string[];

    const press = (key: string) =>
        document.querySelector<HTMLElement>(`#kb [data-key="${key}"]`)!.click();
    const physical = (target: EventTarget, key: string) =>
        target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

    beforeEach(() => {
        document.body.innerHTML = '<input id="in" value="abc"><div id="kb"></div><textarea id="other"></textarea>';
        input = document.getElementById('in') as HTMLInputElement;
        pressed = [];
        keyboard = new VirtualKeyboard('in', 'kb', { onKeyPress: key => pressed.push(key) });
    });

    afterEach(() => keyboard.destroy());

    it('inserts at the caret and deletes before it', () => {
        input.setSelectionRange(1, 1);
        press('x');
        expect(input.value).toBe('axbc');
        press('Backspace');
        expect(input.value).toBe('abc');
        expect(pressed).toEqual(['x', 'Backspace']);
    });

    it('replaces a selection', () => {
        input.setSelectionRange(0, 2);
        press('z');
        expect(input.value).toBe('zc');
    });

    it('dispatches input events', () => {
        let inputs = 0;
        input.addEventListener('input', () => inputs++);
        press('q');
        press('Backspace');
        expect(inputs).toBe(2);
    });

    it('switches modes with the function keys', () => {
        press('Shift');
        expect(keyboard.mode).toBe('shift');
        expect(document.querySelector('#kb [data-key="Q"]')).not.toBeNull();
        press('?123');
        expect(keyboard.mode).toBe('special');
        press('ABC');
        expect(keyboard.mode).toBe('default');
    });

    it('types a space for the Space key', () => {
        input.setSelectionRange(3, 3);
        press('Space');
        expect(input.value).toBe('abc ');
    });

    it('mirrors printable physical keys only', () => {
        input.setSelectionRange(3, 3);
        physical(document.body, 'ArrowLeft');
        expect(input.value).toBe('abc');
        physical(document.body, 'z');
        expect(input.value).toBe('abcz');
    });

    it('ignores physical keys typed into an editable field', () => {
        physical(document.getElementById('other')!, 'q');
        physical(input, 'q');
        expect(input.value).toBe('abc');
    });

    it('throws for a missing input', () => {
        expect(() => new VirtualKeyboard('missing', 'kb')).toThrow();
    });

    it('clears the keyboard on destroy', () => {
        keyboard.destroy();
        expect(document.getElementById('kb')!.children).toHaveLength(0);
    });
});
