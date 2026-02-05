export class LoaderManager {
    constructor(preloadBuiltins = true) {
        this.loaders = new Map();
        this.activeLoaders = new Map();
        this.defaultVars = {
            '--loader-size': '48px',
            '--loader-color': '#FFF',
            '--loader-accent': '#FF3D00',
            '--loader-speed': '1s',
        };
        if (preloadBuiltins) {
            this.registerBuiltinLoaders();
        }
    }
    register(config) {
        this.loaders.set(config.id, config);
        return this;
    }
    registerAll(configs) {
        configs.forEach(config => this.register(config));
        return this;
    }
    create(loaderId, options = {}) {
        const config = this.loaders.get(loaderId);
        if (!config) {
            throw new Error(`Loader "${loaderId}" not found. Register it first.`);
        }
        const { container, useShadowDOM = true, className = '', size, color, accentColor, } = options;
        const wrapper = document.createElement('div');
        wrapper.className = `loader-wrapper ${className}`.trim();
        wrapper.setAttribute('data-loader-id', loaderId);
        if (size) {
            wrapper.style.setProperty('--loader-size', typeof size === 'number' ? `${size}px` : size);
        }
        if (color) {
            wrapper.style.setProperty('--loader-color', color);
        }
        if (accentColor) {
            wrapper.style.setProperty('--loader-accent', accentColor);
        }
        if (useShadowDOM) {
            const shadowRoot = wrapper.attachShadow({ mode: 'open' });
            const styleEl = document.createElement('style');
            styleEl.textContent = this.processCSS(config.css, options);
            shadowRoot.appendChild(styleEl);
            const loaderEl = document.createElement('span');
            loaderEl.className = 'loader';
            if (config.content) {
                loaderEl.innerHTML = config.content;
            }
            shadowRoot.appendChild(loaderEl);
            this.activeLoaders.set(wrapper, { id: loaderId, shadowRoot });
        }
        else {
            const styleEl = document.createElement('style');
            styleEl.textContent = this.scopeCSS(config.css, wrapper, loaderId);
            wrapper.appendChild(styleEl);
            const loaderEl = document.createElement('span');
            loaderEl.className = `loader loader-${loaderId}`;
            if (config.content) {
                loaderEl.innerHTML = config.content;
            }
            wrapper.appendChild(loaderEl);
            this.activeLoaders.set(wrapper, { id: loaderId });
        }
        if (container) {
            const containerEl = typeof container === 'string'
                ? document.querySelector(container)
                : container;
            containerEl === null || containerEl === void 0 ? void 0 : containerEl.appendChild(wrapper);
        }
        return wrapper;
    }
    createOverlay(loaderId, options = {}) {
        const overlay = document.createElement('div');
        overlay.className = 'loader-overlay';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9999;
        `;
        const loader = this.create(loaderId, Object.assign(Object.assign({}, options), { container: overlay }));
        document.body.appendChild(overlay);
        this.activeLoaders.set(overlay, { id: `overlay-${loaderId}` });
        return overlay;
    }
    showIn(loaderId, target, options = {}) {
        const targetEl = typeof target === 'string'
            ? document.querySelector(target)
            : target;
        if (!targetEl) {
            throw new Error(`Target element not found: ${target}`);
        }
        const originalContent = targetEl.innerHTML;
        targetEl.setAttribute('data-original-content', originalContent);
        targetEl.innerHTML = '';
        const loader = this.create(loaderId, Object.assign(Object.assign({}, options), { container: targetEl }));
        return loader;
    }
    hideIn(target) {
        const targetEl = typeof target === 'string'
            ? document.querySelector(target)
            : target;
        if (!targetEl)
            return;
        const originalContent = targetEl.getAttribute('data-original-content');
        if (originalContent !== null) {
            targetEl.innerHTML = originalContent;
            targetEl.removeAttribute('data-original-content');
        }
    }
    destroy(loader) {
        this.activeLoaders.delete(loader);
        loader.remove();
    }
    destroyAll() {
        this.activeLoaders.forEach((_, loader) => this.destroy(loader));
    }
    getRegisteredLoaders() {
        return Array.from(this.loaders.keys());
    }
    has(loaderId) {
        return this.loaders.has(loaderId);
    }
    getConfig(loaderId) {
        return this.loaders.get(loaderId);
    }
    processCSS(css, options) {
        let processed = css;
        processed = processed.replace(/#FFF\b/gi, 'var(--loader-color, #FFF)');
        processed = processed.replace(/#FF3D00\b/gi, 'var(--loader-accent, #FF3D00)');
        processed = processed.replace(/48px/g, 'var(--loader-size, 48px)');
        return processed;
    }
    scopeCSS(css, wrapper, loaderId) {
        return css.replace(/\.loader/g, `.loader-${loaderId}`);
    }
    registerBuiltinLoaders() {
        this.register({
            id: 'spinner',
            css: `.loader {
                width: 48px;
                height: 48px;
                border: 5px solid #FFF;
                border-bottom-color: #FF3D00;
                border-radius: 50%;
                display: inline-block;
                box-sizing: border-box;
                animation: rotation 1s linear infinite;
            }
            @keyframes rotation {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }`
        });
        this.register({
            id: 'spinner-dual',
            css: `.loader {
                width: 48px;
                height: 48px;
                border: 5px solid #FFF;
                border-bottom-color: transparent;
                border-radius: 50%;
                display: inline-block;
                box-sizing: border-box;
                animation: rotation 1s linear infinite;
            }
            @keyframes rotation {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }`
        });
        this.register({
            id: 'dots-bounce',
            css: `.loader, .loader:before, .loader:after {
                border-radius: 50%;
                width: 2.5em;
                height: 2.5em;
                animation-fill-mode: both;
                animation: bblFadInOut 1.8s infinite ease-in-out;
            }
            .loader {
                color: #FFF;
                font-size: 7px;
                position: relative;
                text-indent: -9999em;
                transform: translateZ(0);
                animation-delay: -0.16s;
            }
            .loader:before, .loader:after {
                content: '';
                position: absolute;
                top: 0;
            }
            .loader:before {
                left: -3.5em;
                animation-delay: -0.32s;
            }
            .loader:after {
                left: 3.5em;
            }
            @keyframes bblFadInOut {
                0%, 80%, 100% { box-shadow: 0 2.5em 0 -1.3em }
                40% { box-shadow: 0 2.5em 0 0 }
            }`
        });
        this.register({
            id: 'dots-flash',
            css: `.loader {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background-color: #fff;
                box-shadow: 32px 0 #fff, -32px 0 #fff;
                position: relative;
                animation: flash 0.5s ease-out infinite alternate;
            }
            @keyframes flash {
                0% {
                    background-color: #FFF2;
                    box-shadow: 32px 0 #FFF2, -32px 0 #FFF;
                }
                50% {
                    background-color: #FFF;
                    box-shadow: 32px 0 #FFF2, -32px 0 #FFF2;
                }
                100% {
                    background-color: #FFF2;
                    box-shadow: 32px 0 #FFF, -32px 0 #FFF2;
                }
            }`
        });
        this.register({
            id: 'progress-bar',
            css: `.loader {
                width: 100%;
                height: 4.8px;
                display: inline-block;
                position: relative;
                background: rgba(255, 255, 255, 0.15);
                overflow: hidden;
            }
            .loader::after {
                content: '';
                width: 96px;
                height: 4.8px;
                background: #FFF;
                position: absolute;
                top: 0;
                left: 0;
                box-sizing: border-box;
                animation: hitZak 1s linear infinite alternate;
            }
            @keyframes hitZak {
                0% { left: 0; transform: translateX(-1%); }
                100% { left: 100%; transform: translateX(-99%); }
            }`
        });
        this.register({
            id: 'progress-fill',
            css: `.loader {
                width: 100%;
                height: 4.8px;
                display: inline-block;
                position: relative;
                background: rgba(255, 255, 255, 0.15);
                overflow: hidden;
            }
            .loader::after {
                content: '';
                box-sizing: border-box;
                width: 0;
                height: 4.8px;
                background: #FFF;
                position: absolute;
                top: 0;
                left: 0;
                animation: animFw 10s linear infinite;
            }
            @keyframes animFw {
                0% { width: 0; }
                100% { width: 100%; }
            }`
        });
        this.register({
            id: 'pulse',
            css: `.loader {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                display: inline-block;
                position: relative;
                background: #FFF;
                box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.5);
                animation: pulse 1.5s ease-out infinite;
            }
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.5); }
                100% { box-shadow: 0 0 0 30px rgba(255, 255, 255, 0); }
            }`
        });
        this.register({
            id: 'square-flip',
            css: `.loader {
                width: 48px;
                height: 48px;
                display: inline-block;
                position: relative;
                background: #FFF;
                box-sizing: border-box;
                animation: flipX 1s linear infinite;
            }
            @keyframes flipX {
                0% { transform: perspective(200px) rotateX(0deg) rotateY(0deg); }
                50% { transform: perspective(200px) rotateX(-180deg) rotateY(0deg); }
                100% { transform: perspective(200px) rotateX(-180deg) rotateY(-180deg); }
            }`
        });
        this.register({
            id: 'skeleton-card',
            css: `.loader {
                width: 320px;
                height: 150px;
                display: block;
                margin: auto;
                position: relative;
                background: #FFF;
                box-sizing: border-box;
            }
            .loader::after {
                content: '';
                width: calc(100% - 30px);
                height: calc(100% - 30px);
                top: 15px;
                left: 15px;
                position: absolute;
                background-image:
                    linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.5) 50%, transparent 80%),
                    linear-gradient(#DDD 56px, transparent 0),
                    linear-gradient(#DDD 24px, transparent 0),
                    linear-gradient(#DDD 18px, transparent 0),
                    linear-gradient(#DDD 66px, transparent 0);
                background-repeat: no-repeat;
                background-size: 75px 130px, 55px 56px, 160px 30px, 260px 20px, 290px 56px;
                background-position: 0% 0, 0 0, 70px 5px, 70px 38px, 0px 66px;
                box-sizing: border-box;
                animation: animloader 1s linear infinite;
            }
            @keyframes animloader {
                0% { background-position: 0% 0, 0 0, 70px 5px, 70px 38px, 0px 66px; }
                100% { background-position: 150% 0, 0 0, 70px 5px, 70px 38px, 0px 66px; }
            }`
        });
        this.register({
            id: 'bars-wave',
            css: `.loader {
                color: #FFF;
                position: relative;
                font-size: 11px;
                background: #FFF;
                animation: escaleY 1s infinite ease-in-out;
                width: 1em;
                height: 4em;
                animation-delay: -0.16s;
            }
            .loader:before, .loader:after {
                content: '';
                position: absolute;
                top: 0;
                left: 2em;
                background: #FFF;
                width: 1em;
                height: 4em;
                animation: escaleY 1s infinite ease-in-out;
            }
            .loader:before {
                left: -2em;
                animation-delay: -0.32s;
            }
            @keyframes escaleY {
                0%, 80%, 100% { box-shadow: 0 0; height: 4em; }
                40% { box-shadow: 0 -2em; height: 5em; }
            }`
        });
    }
}
export const loaderManager = new LoaderManager();
export default LoaderManager;
//# sourceMappingURL=LoaderManager.js.map