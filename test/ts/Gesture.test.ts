import { beforeEach, describe, expect, it } from 'vitest';
import { AdvancedGestureRecognition, TouchGestureHandler } from '../../src/ts/Gesture';

type Point = [x: number, y: number];

describe('TouchGestureHandler', () => {
    let element: HTMLElement;

    const fire = (type: string, points: Point[]) => {
        const event = new Event(type);
        const touches = points.map(([clientX, clientY], identifier) => ({ identifier, clientX, clientY, target: element }));
        Object.defineProperty(event, 'touches', { value: touches });
        element.dispatchEvent(event);
    };

    beforeEach(() => {
        document.body.innerHTML = '<div id="g"></div>';
        element = document.getElementById('g')!;
    });

    it('reports pinch scale and rotation, without a tap afterwards', () => {
        let taps = 0;
        let scale = 0;
        let angle = 0;
        new TouchGestureHandler('g', { onTap: () => taps++, onPinch: s => (scale = s), onRotate: a => (angle = a) });

        fire('touchstart', [[0, 0], [100, 0]]);
        fire('touchmove', [[0, 0], [0, 200]]);
        fire('touchend', [[0, 0]]);
        fire('touchend', []);

        expect(scale).toBeCloseTo(2);
        expect(angle).toBeCloseTo(90);
        expect(taps).toBe(0);
    });

    it('normalises rotation across the atan2 seam', () => {
        let angle = 0;
        new TouchGestureHandler('g', { onRotate: a => (angle = a) });
        fire('touchstart', [[0, 0], [-100, 1]]);
        fire('touchmove', [[0, 0], [-100, -1]]);
        expect(Math.abs(angle)).toBeLessThan(5);
    });

    it('distinguishes swipes from taps', () => {
        let taps = 0;
        const swipes: string[] = [];
        new TouchGestureHandler('g', { onTap: () => taps++, onSwipe: direction => swipes.push(direction) });

        fire('touchstart', [[0, 0]]);
        fire('touchmove', [[-50, 5]]);
        fire('touchend', []);
        fire('touchstart', [[0, 0]]);
        fire('touchend', []);

        expect(swipes).toEqual(['left']);
        expect(taps).toBe(1);
    });

    it('stops listening after destroy', () => {
        let taps = 0;
        new TouchGestureHandler('g', { onTap: () => taps++ }).destroy();
        fire('touchstart', [[0, 0]]);
        fire('touchend', []);
        expect(taps).toBe(0);
    });
});

describe('AdvancedGestureRecognition', () => {
    it('reports movement relative to pointer down and ignores untracked pointers', () => {
        document.body.innerHTML = '<div id="g"></div>';
        const element = document.getElementById('g')!;
        element.setPointerCapture = () => undefined;

        const moves: Array<[number, number]> = [];
        let ends = 0;
        new AdvancedGestureRecognition('g', { onGestureMove: (dx, dy) => moves.push([dx, dy]), onGestureEnd: () => ends++ });

        const fire = (type: string, x: number, y: number, pointerId = 1) =>
            element.dispatchEvent(new PointerEvent(type, { pointerId, clientX: x, clientY: y }));

        fire('pointerup', 0, 0, 7);
        fire('pointerdown', 10, 10);
        fire('pointermove', 25, 5);
        fire('pointerup', 25, 5);
        fire('pointermove', 99, 99);

        expect(moves).toEqual([[15, -5]]);
        expect(ends).toBe(1);
    });
});
