import { beforeEach, describe, expect, it } from 'vitest';
import { Draggable } from '../../src/ts/Draggable';

// happy-dom has no layout, so the parent (300x200 at 100,100) and the element
// (50x50 at offset 10,10) are stubbed.
function setup() {
    document.body.innerHTML = '<div id="p"><div id="e"></div></div>';
    const parent = document.getElementById('p')!;
    const element = document.getElementById('e')!;

    parent.getBoundingClientRect = () => ({ left: 100, top: 100, right: 400, bottom: 300 }) as DOMRect;
    Object.defineProperties(parent, {
        clientWidth: { value: 300 }, clientHeight: { value: 200 }, clientLeft: { value: 0 }, clientTop: { value: 0 },
    });
    Object.defineProperties(element, {
        offsetLeft: { get: () => parseFloat(element.style.left || '10') },
        offsetTop: { get: () => parseFloat(element.style.top || '10') },
    });
    element.getBoundingClientRect = () => ({ left: 110, top: 110, right: 160, bottom: 160 }) as DOMRect;
    element.setPointerCapture = () => undefined;
    element.hasPointerCapture = () => true;
    element.releasePointerCapture = () => undefined;

    const pointer = (type: string, x: number, y: number, init: PointerEventInit = {}) =>
        element.dispatchEvent(new PointerEvent(type, {
            pointerId: 1, clientX: x, clientY: y, button: 0, pointerType: 'mouse', ...init,
        }));

    return { element, pointer };
}

describe('Draggable', () => {
    let element: HTMLElement;
    let pointer: ReturnType<typeof setup>['pointer'];

    beforeEach(() => ({ element, pointer } = setup()));

    it('moves with the pointer and stays inside the parent', () => {
        new Draggable('e');
        pointer('pointerdown', 120, 120);
        pointer('pointermove', 170, 140);
        expect([element.style.left, element.style.top]).toEqual(['60px', '30px']);

        pointer('pointermove', 1000, 1000);
        expect([element.style.left, element.style.top]).toEqual(['250px', '150px']);

        pointer('pointermove', -1000, -1000);
        expect([element.style.left, element.style.top]).toEqual(['0px', '0px']);
    });

    it('can move freely when not constrained', () => {
        new Draggable('e', { constrainToParent: false });
        pointer('pointerdown', 120, 120);
        pointer('pointermove', 1120, 120);
        expect(element.style.left).toBe('1010px');
    });

    it('ignores other pointers, secondary buttons and moves after release', () => {
        new Draggable('e');
        pointer('pointerdown', 120, 120, { button: 2 });
        pointer('pointermove', 170, 140);
        expect(element.style.left).toBe('');

        pointer('pointerdown', 120, 120);
        pointer('pointermove', 130, 130, { pointerId: 2 });
        expect(element.style.left).toBe('');

        pointer('pointerup', 120, 120);
        pointer('pointermove', 170, 140);
        expect(element.style.left).toBe('');
    });

    it('calls the drag callbacks and restores styles', () => {
        const events: string[] = [];
        const draggable = new Draggable('e', {
            onDragStart: (x, y) => events.push(`start ${x},${y}`),
            onDrag: (x, y) => events.push(`drag ${x},${y}`),
            onDragEnd: (x, y) => events.push(`end ${x},${y}`),
        });
        expect(element.style.touchAction).toBe('none');

        pointer('pointerdown', 120, 120);
        expect(element.style.cursor).toBe('grabbing');
        pointer('pointermove', 130, 125);
        pointer('pointerup', 130, 125);

        expect(events).toEqual(['start 10,10', 'drag 20,15', 'end 20,15']);
        expect(element.style.cursor).toBe('');

        draggable.destroy();
        expect(element.style.touchAction).toBe('');
    });
});
