import { beforeEach, describe, expect, it } from 'vitest';
import { LoaderManager } from '../../src/ts/LoaderManager';

describe('LoaderManager', () => {
    let manager: LoaderManager;

    beforeEach(() => {
        document.body.innerHTML = '<div id="box"><button id="b">orig</button></div>';
        manager = new LoaderManager();
    });

    it('restores the original nodes, with their listeners, after showIn/hideIn', () => {
        const button = document.getElementById('b')!;
        let clicks = 0;
        button.addEventListener('click', () => clicks++);

        manager.showIn('spinner', '#box');
        manager.showIn('pulse', '#box');
        expect(document.querySelectorAll('#box .loader-wrapper')).toHaveLength(1);

        manager.hideIn('#box');
        const restored = document.getElementById('b')!;
        restored.click();
        expect(restored).toBe(button);
        expect(clicks).toBe(1);
        expect(document.getElementById('box')!.hasAttribute('aria-busy')).toBe(false);
    });

    it('applies options and scopes CSS without Shadow DOM', () => {
        const wrapper = manager.create('spinner', { useShadowDOM: false, color: 'red', container: document.body });
        const css = wrapper.querySelector('style')!.textContent!;
        expect(css).toContain('var(--loader-color');
        expect(css).toContain('.loader-spinner');
        expect(css).toContain('@keyframes spinner--rotation');
        expect(wrapper.style.getPropertyValue('--loader-color')).toBe('red');
        expect(wrapper.querySelector('span')!.className).toBe('loader loader-spinner');
        expect(wrapper.getAttribute('role')).toBe('progressbar');
    });

    it('renders in a shadow root by default', () => {
        const wrapper = manager.create('spinner', { size: 32 });
        expect(wrapper.shadowRoot!.querySelector('.loader')).not.toBeNull();
        expect(wrapper.style.getPropertyValue('--loader-size')).toBe('32px');
    });

    it('honours the html override', () => {
        manager.register({ id: 'custom', css: '.loader { width: 48px; }', html: '<div class="loader"><i></i></div>' });
        const wrapper = manager.create('custom', { useShadowDOM: false });
        expect(wrapper.querySelector('div.loader.loader-custom i')).not.toBeNull();
        expect(wrapper.querySelector('style')!.textContent).toMatch(/var\(--loader-size, 48px\)/);
    });

    it('removes overlays and nested loaders', () => {
        const overlay = manager.createOverlay('spinner');
        manager.create('pulse', { container: document.body });
        manager.destroy(overlay);
        manager.destroyAll();
        expect(document.querySelectorAll('.loader-wrapper, .loader-overlay')).toHaveLength(0);
    });

    it('throws for an unknown loader', () => {
        expect(() => manager.create('nope')).toThrow(/not found/);
    });
});
