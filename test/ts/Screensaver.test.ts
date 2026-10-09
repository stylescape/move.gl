import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Screensaver } from '../../src/ts/Screensaver';

describe('Screensaver', () => {
    let screensaver: Screensaver;
    let container: HTMLElement;

    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = '<div id="screensaver" style="display: block"></div>';
        container = document.getElementById('screensaver')!;
        screensaver = new Screensaver({ timeout: 1000 });
    });

    afterEach(() => {
        screensaver.destroy();
        vi.useRealTimers();
    });

    it('starts hidden and activates after the timeout', () => {
        expect(container.style.display).toBe('none');
        vi.advanceTimersByTime(999);
        expect(screensaver.getIsActive()).toBe(false);
        vi.advanceTimersByTime(1);
        expect(screensaver.getIsActive()).toBe(true);
        expect(container.style.display).toBe('block');
    });

    it('is dismissed by activity, which also restarts the timer', () => {
        vi.advanceTimersByTime(1000);
        document.dispatchEvent(new Event('keydown'));
        expect(screensaver.getIsActive()).toBe(false);
        vi.advanceTimersByTime(500);
        document.dispatchEvent(new Event('pointermove'));
        vi.advanceTimersByTime(999);
        expect(screensaver.getIsActive()).toBe(false);
    });

    it('supports start() and stop()', () => {
        screensaver.start();
        expect(screensaver.getIsActive()).toBe(true);
        screensaver.stop();
        expect(screensaver.getIsActive()).toBe(false);
        vi.advanceTimersByTime(1000);
        expect(screensaver.getIsActive()).toBe(true);
    });

    it('does not reactivate after destroy', () => {
        screensaver.destroy();
        vi.advanceTimersByTime(5000);
        expect(screensaver.getIsActive()).toBe(false);
    });
});
