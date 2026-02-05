function initThemeToggle() {
    const themeToggle = document.querySelector('[data-toggle="theme"]');
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    }
    else if (systemPrefersDark) {
        html.setAttribute('data-theme', 'dark');
    }
    themeToggle === null || themeToggle === void 0 ? void 0 : themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}
function initNavDropdown() {
    const dropdown = document.getElementById('nav-dropdown');
    const toggle = dropdown === null || dropdown === void 0 ? void 0 : dropdown.querySelector('.nav__dropdown-toggle');
    if (!dropdown || !toggle)
        return;
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dropdown.classList.contains('open')) {
            dropdown.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.focus();
        }
    });
}
function initTabs() {
    const tabContainers = document.querySelectorAll('[data-tabs]');
    tabContainers.forEach((container) => {
        const tabs = container.querySelectorAll('.tab');
        const contents = container.querySelectorAll('.tab-content');
        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                const targetId = tab.dataset.target;
                tabs.forEach((t) => t.classList.remove('active'));
                tab.classList.add('active');
                contents.forEach((content) => {
                    content.classList.toggle('active', content.id === targetId);
                });
            });
        });
    });
}
class LogOutput {
    constructor(selector, maxEntries = 50) {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(`Log output container not found: ${selector}`);
        }
        this.container = element;
        this.maxEntries = maxEntries;
    }
    log(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry log-entry--${type}`;
        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        timestamp.textContent = new Date().toLocaleTimeString();
        const text = document.createElement('span');
        text.textContent = message;
        entry.appendChild(timestamp);
        entry.appendChild(text);
        this.container.appendChild(entry);
        while (this.container.children.length > this.maxEntries) {
            this.container.removeChild(this.container.firstChild);
        }
        this.container.scrollTop = this.container.scrollHeight;
    }
    clear() {
        this.container.innerHTML = '';
    }
}
function formatValue(value, unit) {
    return `${value}${unit}`;
}
function debounce(func, wait) {
    let timeout = null;
    return (...args) => {
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
function throttle(func, limit) {
    let inThrottle = false;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
function initDemo() {
    initThemeToggle();
    initNavDropdown();
    initTabs();
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDemo);
}
else {
    initDemo();
}
export { debounce, formatValue, initNavDropdown, initTabs, initThemeToggle, LogOutput, throttle };
class DemoDraggable {
    constructor(elementId, onDrag) {
        var _a;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.element = document.getElementById(elementId);
        this.onDrag = onDrag;
        if ((_a = this.element) === null || _a === void 0 ? void 0 : _a.parentElement) {
            this.boundRect = this.element.parentElement.getBoundingClientRect();
            this.attachEventListeners();
        }
    }
    attachEventListeners() {
        if (!this.element)
            return;
        this.element.addEventListener('mousedown', this.startDrag.bind(this));
        this.element.addEventListener('touchstart', this.startDrag.bind(this), { passive: false });
        document.addEventListener('mouseup', this.stopDrag.bind(this));
        document.addEventListener('touchend', this.stopDrag.bind(this));
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('touchmove', this.drag.bind(this), { passive: false });
    }
    getCoords(event) {
        if ('touches' in event && event.touches.length > 0) {
            return { clientX: event.touches[0].clientX, clientY: event.touches[0].clientY };
        }
        return { clientX: event.clientX, clientY: event.clientY };
    }
    startDrag(event) {
        var _a;
        if (!this.element)
            return;
        event.preventDefault();
        const coords = this.getCoords(event);
        this.isDragging = true;
        this.startX = coords.clientX - this.element.offsetLeft;
        this.startY = coords.clientY - this.element.offsetTop;
        (_a = this.onDrag) === null || _a === void 0 ? void 0 : _a.call(this, 'start', this.element.id, coords.clientX, coords.clientY);
    }
    stopDrag(event) {
        var _a;
        if (this.isDragging && this.element) {
            this.isDragging = false;
            const coords = this.getCoords(event);
            (_a = this.onDrag) === null || _a === void 0 ? void 0 : _a.call(this, 'end', this.element.id, coords.clientX || 0, coords.clientY || 0);
        }
    }
    drag(event) {
        var _a, _b;
        if (!this.isDragging || !((_a = this.element) === null || _a === void 0 ? void 0 : _a.parentElement))
            return;
        event.preventDefault();
        const coords = this.getCoords(event);
        const container = this.element.parentElement.getBoundingClientRect();
        let newX = coords.clientX - this.startX;
        let newY = coords.clientY - this.startY;
        newX = Math.max(0, Math.min(newX, container.width - this.element.offsetWidth));
        newY = Math.max(0, Math.min(newY, container.height - this.element.offsetHeight));
        this.element.style.left = `${newX}px`;
        this.element.style.top = `${newY}px`;
        this.element.style.right = 'auto';
        this.element.style.bottom = 'auto';
        this.element.style.transform = 'none';
        (_b = this.onDrag) === null || _b === void 0 ? void 0 : _b.call(this, 'drag', this.element.id, Math.round(newX), Math.round(newY));
    }
}
class DemoKeyboard {
    constructor(inputId, containerId) {
        this.layouts = {
            default: [
                ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
                ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                ['⇧', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫'],
                ['123', ' ', '.', '↵']
            ],
            shift: [
                ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
                ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
                ['⇧', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
                ['123', ' ', '.', '↵']
            ],
            special: [
                ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
                ['@', '#', '$', '%', '&', '*', '-', '+', '='],
                ['!', '"', "'", ':', ';', '/', '?', '⌫'],
                ['ABC', ' ', '.', '↵']
            ]
        };
        this.currentMode = 'default';
        this.stats = { chars: 0, words: 0, keys: 0 };
        this.input = document.getElementById(inputId);
        this.container = document.getElementById(containerId);
        this.render();
    }
    render() {
        if (!this.container)
            return;
        const layout = this.layouts[this.currentMode];
        this.container.innerHTML = layout.map(row => `<div class="keyboard-row">${row.map(key => {
            let cls = 'key';
            if (key === ' ')
                cls += ' key--space';
            if (key === '⇧')
                cls += ' key--shift';
            if (key === '⌫')
                cls += ' key--backspace';
            if (key === '↵')
                cls += ' key--enter';
            if (key === '123' || key === 'ABC')
                cls += ' key--mode';
            return `<button class="${cls}" data-key="${key}">${key === ' ' ? 'space' : key}</button>`;
        }).join('')}</div>`).join('');
        this.container.querySelectorAll('.key').forEach(btn => {
            btn.addEventListener('click', () => { var _a; return this.handleKey((_a = btn.dataset.key) !== null && _a !== void 0 ? _a : ''); });
        });
    }
    handleKey(key) {
        if (!this.input)
            return;
        this.stats.keys++;
        if (key === '⌫') {
            this.input.value = this.input.value.slice(0, -1);
        }
        else if (key === '↵') {
            this.input.value += '\n';
        }
        else if (key === '⇧') {
            this.switchMode(this.currentMode === 'shift' ? 'default' : 'shift');
            return;
        }
        else if (key === '123') {
            this.switchMode('special');
            return;
        }
        else if (key === 'ABC') {
            this.switchMode('default');
            return;
        }
        else {
            this.input.value += key;
            this.stats.chars++;
        }
        this.stats.words = this.input.value.trim().split(/\s+/).filter(w => w).length;
        this.updateStats();
    }
    switchMode(mode) {
        this.currentMode = mode;
        this.render();
        document.querySelectorAll('.mode-btn').forEach(btn => {
            var _a;
            btn.classList.toggle('active', (mode === 'default' && btn.textContent === 'ABC') ||
                (mode === 'shift' && ((_a = btn.textContent) === null || _a === void 0 ? void 0 : _a.includes('SHIFT'))) ||
                (mode === 'special' && btn.textContent === '123'));
        });
    }
    updateStats() {
        const charEl = document.getElementById('charCount');
        const wordEl = document.getElementById('wordCount');
        const keyEl = document.getElementById('keypressCount');
        if (charEl)
            charEl.textContent = String(this.stats.chars);
        if (wordEl)
            wordEl.textContent = String(this.stats.words);
        if (keyEl)
            keyEl.textContent = String(this.stats.keys);
    }
    getStats() {
        return Object.assign({}, this.stats);
    }
}
class DemoGesture {
    constructor(elementId) {
        this.stats = { taps: 0, swipes: 0, pinches: 0 };
        this.startX = 0;
        this.startY = 0;
        this.startTime = 0;
        this.isDragging = false;
        this.element = document.getElementById(elementId);
        if (this.element) {
            this.attachEventListeners();
        }
    }
    attachEventListeners() {
        if (!this.element)
            return;
        this.element.addEventListener('mousedown', (e) => this.handleStart(e.clientX, e.clientY));
        document.addEventListener('mouseup', (e) => this.handleEnd(e.clientX, e.clientY));
        this.element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                this.handleStart(e.touches[0].clientX, e.touches[0].clientY);
            }
            else if (e.touches.length === 2) {
                this.handlePinch();
            }
        });
        this.element.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 1) {
                this.handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            }
        });
    }
    handleStart(x, y) {
        this.startX = x;
        this.startY = y;
        this.startTime = Date.now();
        this.isDragging = true;
    }
    handleEnd(x, y) {
        if (!this.isDragging)
            return;
        this.isDragging = false;
        const dx = x - this.startX;
        const dy = y - this.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const duration = Date.now() - this.startTime;
        if (dist < 10 && duration < 300) {
            this.handleTap();
        }
        else if (dist > 50) {
            const direction = this.getSwipeDirection(dx, dy);
            this.handleSwipe(direction, dx, dy);
        }
    }
    getSwipeDirection(dx, dy) {
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 'right' : 'left';
        }
        return dy > 0 ? 'down' : 'up';
    }
    handleTap() {
        this.stats.taps++;
        this.updateUI('tap');
    }
    handleSwipe(direction, _dx, _dy) {
        this.stats.swipes++;
        this.updateUI('swipe', direction);
    }
    handlePinch() {
        this.stats.pinches++;
        this.updateUI('pinch');
    }
    updateUI(type, direction) {
        const tapCount = document.getElementById('tapCount');
        const swipeCount = document.getElementById('swipeCount');
        const pinchCount = document.getElementById('pinchCount');
        const lastDirection = document.getElementById('lastDirection');
        if (tapCount)
            tapCount.textContent = String(this.stats.taps);
        if (swipeCount)
            swipeCount.textContent = String(this.stats.swipes);
        if (pinchCount)
            pinchCount.textContent = String(this.stats.pinches);
        if (direction && lastDirection)
            lastDirection.textContent = direction;
        const feedback = document.getElementById('gestureFeedback');
        if (feedback) {
            feedback.textContent = type === 'swipe' ? `Swiped ${direction}!` : `${type.charAt(0).toUpperCase() + type.slice(1)} detected!`;
            feedback.classList.add('visible');
            setTimeout(() => feedback.classList.remove('visible'), 1500);
        }
        if (direction) {
            this.showDirectionIndicator(direction);
        }
    }
    showDirectionIndicator(direction) {
        document.querySelectorAll('.direction-indicator').forEach(el => el.classList.remove('active'));
        const indicator = document.getElementById(`dir${direction.charAt(0).toUpperCase() + direction.slice(1)}`);
        if (indicator) {
            indicator.classList.add('active');
            setTimeout(() => indicator.classList.remove('active'), 300);
        }
    }
    resetStats() {
        this.stats = { taps: 0, swipes: 0, pinches: 0 };
        this.updateUI('reset');
        const lastDirection = document.getElementById('lastDirection');
        if (lastDirection)
            lastDirection.textContent = '—';
    }
}
class DemoScreensaver {
    constructor(options = {}) {
        var _a, _b;
        this.isActive = false;
        this.timeoutId = null;
        this.eventCount = 0;
        this.timeout = (_a = options.timeout) !== null && _a !== void 0 ? _a : 10000;
        this.fadeDuration = (_b = options.fadeDuration) !== null && _b !== void 0 ? _b : 500;
        this.lastActivity = Date.now();
        this.screensaverContent = document.getElementById('screensaverContent');
        this.placeholder = document.getElementById('placeholder');
        this.statusDot = document.getElementById('statusDot');
        this.statusText = document.getElementById('statusText');
        this.countdown = document.getElementById('countdown');
        this.activityLog = document.getElementById('activityLog');
        this.setupEventListeners();
        this.startTimeout();
        this.updateCountdown();
    }
    setupEventListeners() {
        ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
            document.addEventListener(event, () => this.resetTimeout(), { passive: true });
        });
    }
    log(message) {
        if (!this.activityLog)
            return;
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'entry';
        entry.textContent = `[${time}] ${message}`;
        this.activityLog.appendChild(entry);
        this.activityLog.scrollTop = this.activityLog.scrollHeight;
    }
    resetTimeout() {
        if (this.isActive)
            this.deactivate();
        this.lastActivity = Date.now();
        this.eventCount++;
        const eventCountEl = document.getElementById('eventCount');
        if (eventCountEl)
            eventCountEl.textContent = String(this.eventCount);
        if (this.timeoutId)
            clearTimeout(this.timeoutId);
        this.startTimeout();
    }
    startTimeout() {
        this.timeoutId = setTimeout(() => this.activate(), this.timeout);
    }
    updateCountdown() {
        setInterval(() => {
            if (!this.isActive && this.countdown) {
                const elapsed = Date.now() - this.lastActivity;
                const remaining = Math.max(0, Math.ceil((this.timeout - elapsed) / 1000));
                this.countdown.textContent = `${remaining}s`;
            }
        }, 100);
    }
    activate() {
        var _a, _b;
        this.isActive = true;
        (_a = this.screensaverContent) === null || _a === void 0 ? void 0 : _a.classList.add('active');
        if (this.placeholder)
            this.placeholder.style.opacity = '0';
        (_b = this.statusDot) === null || _b === void 0 ? void 0 : _b.classList.add('screensaver-active');
        if (this.statusText)
            this.statusText.textContent = 'Screensaver active';
        if (this.countdown)
            this.countdown.textContent = '💤';
        this.log('Screensaver activated');
    }
    deactivate() {
        var _a, _b;
        this.isActive = false;
        (_a = this.screensaverContent) === null || _a === void 0 ? void 0 : _a.classList.remove('active');
        if (this.placeholder)
            this.placeholder.style.opacity = '1';
        (_b = this.statusDot) === null || _b === void 0 ? void 0 : _b.classList.remove('screensaver-active');
        if (this.statusText)
            this.statusText.textContent = 'Monitoring activity';
        this.log('Screensaver deactivated');
    }
    setTimeout(timeout) {
        this.timeout = timeout;
        this.resetTimeout();
    }
    setFadeDuration(duration) {
        this.fadeDuration = duration;
        if (this.screensaverContent) {
            this.screensaverContent.style.transition = `opacity ${duration}ms ease`;
        }
    }
    getEventCount() {
        return this.eventCount;
    }
    resetEventCount() {
        this.eventCount = 0;
        const eventCountEl = document.getElementById('eventCount');
        if (eventCountEl)
            eventCountEl.textContent = '0';
    }
}
class DemoVideoOverlay {
    constructor() {
        this.isVisible = false;
        this.currentEffect = 'vignette';
        this.opacity = 1;
        this.fadeDuration = 300;
        this.blurAmount = 0;
        this.overlay = document.getElementById('videoOverlay');
        this.particles = document.getElementById('particles');
        this.checkHevcSupport();
        this.setupControls();
        this.createParticles();
    }
    checkHevcSupport() {
        const indicator = document.getElementById('alphaIndicator');
        if (!indicator)
            return;
        const video = document.createElement('video');
        const canPlayHevc = video.canPlayType('video/mp4; codecs="hvc1"') !== '';
        if (canPlayHevc) {
            indicator.className = 'alpha-indicator supported';
            indicator.textContent = '✓ HEVC Supported';
        }
        else {
            indicator.className = 'alpha-indicator unsupported';
            indicator.textContent = '✗ HEVC Not Supported';
        }
    }
    setupControls() {
        var _a, _b, _c, _d, _e, _f;
        (_a = document.getElementById('opacitySlider')) === null || _a === void 0 ? void 0 : _a.addEventListener('input', (e) => {
            const target = e.target;
            this.opacity = parseInt(target.value) / 100;
            const valueEl = document.getElementById('opacityValue');
            if (valueEl)
                valueEl.textContent = `${target.value}%`;
            if (this.isVisible && this.overlay)
                this.overlay.style.opacity = String(this.opacity);
        });
        (_b = document.getElementById('fadeSlider')) === null || _b === void 0 ? void 0 : _b.addEventListener('input', (e) => {
            const target = e.target;
            this.fadeDuration = parseInt(target.value);
            const valueEl = document.getElementById('fadeValue');
            if (valueEl)
                valueEl.textContent = target.value;
            if (this.overlay)
                this.overlay.style.transition = `opacity ${this.fadeDuration}ms ease`;
        });
        (_c = document.getElementById('blurSlider')) === null || _c === void 0 ? void 0 : _c.addEventListener('input', (e) => {
            const target = e.target;
            this.blurAmount = parseInt(target.value);
            const valueEl = document.getElementById('blurValue');
            if (valueEl)
                valueEl.textContent = target.value;
            if (this.overlay) {
                this.overlay.style.backdropFilter = this.blurAmount > 0 ? `blur(${this.blurAmount}px)` : 'none';
            }
        });
        document.querySelectorAll('.effect-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                var _a;
                document.querySelectorAll('.effect-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setEffect((_a = btn.dataset.effect) !== null && _a !== void 0 ? _a : 'none');
            });
        });
        (_d = document.getElementById('toggleOverlay')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => this.toggle());
        (_e = document.getElementById('fadeInOut')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => this.fadeInOut());
        (_f = document.getElementById('resetDemo')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', () => this.reset());
    }
    createParticles() {
        if (!this.particles)
            return;
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 3}s`;
            particle.style.animationDuration = `${2 + Math.random() * 2}s`;
            this.particles.appendChild(particle);
        }
    }
    setEffect(effect) {
        var _a;
        this.currentEffect = effect;
        const overlayEffect = (_a = this.overlay) === null || _a === void 0 ? void 0 : _a.querySelector('.overlay-effect');
        if (!overlayEffect || !this.particles)
            return;
        switch (effect) {
            case 'none':
                overlayEffect.style.background = 'transparent';
                this.particles.style.display = 'none';
                break;
            case 'vignette':
                overlayEffect.style.background = 'radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, 0.8) 100%)';
                this.particles.style.display = 'none';
                break;
            case 'particles':
                overlayEffect.style.background = 'transparent';
                this.particles.style.display = 'block';
                break;
            case 'gradient':
                overlayEffect.style.background = 'linear-gradient(to bottom, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3))';
                this.particles.style.display = 'none';
                break;
            case 'scanlines':
                overlayEffect.style.background = 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 2px)';
                this.particles.style.display = 'none';
                break;
        }
    }
    toggle() {
        var _a;
        this.isVisible = !this.isVisible;
        (_a = this.overlay) === null || _a === void 0 ? void 0 : _a.classList.toggle('visible', this.isVisible);
        if (this.isVisible && this.overlay)
            this.overlay.style.opacity = String(this.opacity);
        const toggleBtn = document.getElementById('toggleOverlay');
        if (toggleBtn)
            toggleBtn.textContent = this.isVisible ? 'Hide Overlay' : 'Show Overlay';
    }
    fadeInOut() {
        if (!this.isVisible) {
            this.toggle();
            setTimeout(() => this.toggle(), this.fadeDuration * 3);
        }
    }
    reset() {
        var _a;
        this.isVisible = false;
        (_a = this.overlay) === null || _a === void 0 ? void 0 : _a.classList.remove('visible');
        const toggleBtn = document.getElementById('toggleOverlay');
        if (toggleBtn)
            toggleBtn.textContent = 'Show Overlay';
        const opacitySlider = document.getElementById('opacitySlider');
        const opacityValue = document.getElementById('opacityValue');
        const fadeSlider = document.getElementById('fadeSlider');
        const fadeValue = document.getElementById('fadeValue');
        const blurSlider = document.getElementById('blurSlider');
        const blurValue = document.getElementById('blurValue');
        if (opacitySlider)
            opacitySlider.value = '100';
        if (opacityValue)
            opacityValue.textContent = '100%';
        if (fadeSlider)
            fadeSlider.value = '300';
        if (fadeValue)
            fadeValue.textContent = '300';
        if (blurSlider)
            blurSlider.value = '0';
        if (blurValue)
            blurValue.textContent = '0';
        this.opacity = 1;
        this.fadeDuration = 300;
        this.blurAmount = 0;
        if (this.overlay) {
            this.overlay.style.transition = 'opacity 300ms ease';
            this.overlay.style.backdropFilter = 'none';
        }
    }
}
function initDraggableDemo() {
    const logOutput = document.getElementById('logOutput');
    function log(message) {
        if (!logOutput)
            return;
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `<span class="timestamp">[${time}]</span> ${message}`;
        logOutput.appendChild(entry);
        logOutput.scrollTop = logOutput.scrollHeight;
    }
    function handleDrag(type, id, x, y) {
        if (type === 'start') {
            log(`<strong>${id}</strong>: Drag started`);
        }
        else if (type === 'end') {
            log(`<strong>${id}</strong>: Drag ended`);
        }
        else {
            log(`<strong>${id}</strong>: Position (${x}, ${y})`);
        }
    }
    new DemoDraggable('box1', handleDrag);
    new DemoDraggable('box2', handleDrag);
    new DemoDraggable('box3', handleDrag);
    window.resetPositions = () => {
        const box1 = document.getElementById('box1');
        const box2 = document.getElementById('box2');
        const box3 = document.getElementById('box3');
        if (box1)
            box1.style.cssText = 'top: 50px; left: 50px;';
        if (box2)
            box2.style.cssText = 'top: 50px; right: 50px;';
        if (box3)
            box3.style.cssText = 'bottom: 50px; left: 50%; transform: translateX(-50%);';
        log('Positions reset');
    };
    window.clearLog = () => {
        if (logOutput) {
            logOutput.innerHTML = '<div class="log-entry"><span class="timestamp">[--:--:--]</span> Log cleared</div>';
        }
    };
    log('Draggable demo initialized. Try dragging the boxes!');
}
function initKeyboardDemo() {
    const keyboard = new DemoKeyboard('keyboardInput', 'keyboard');
    window.switchMode = (mode) => {
        keyboard.switchMode(mode);
    };
}
function initGestureDemo() {
    const gesture = new DemoGesture('gestureArea');
    function log(type, details) {
        const gestureLog = document.getElementById('gestureLog');
        if (!gestureLog)
            return;
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'entry';
        entry.innerHTML = `<span class="timestamp">${time}</span><span class="type">${type}</span><span class="details">${details}</span>`;
        gestureLog.appendChild(entry);
        gestureLog.scrollTop = gestureLog.scrollHeight;
    }
    window.resetStats = () => {
        gesture.resetStats();
        log('RESET', 'Stats cleared');
    };
    window.clearLog = () => {
        const gestureLog = document.getElementById('gestureLog');
        if (gestureLog) {
            gestureLog.innerHTML = '<div class="entry"><span class="timestamp">--:--:--</span><span class="type">INIT</span><span class="details">Log cleared</span></div>';
        }
    };
    log('READY', 'Gesture handler initialized');
}
function initScreensaverDemo() {
    var _a, _b;
    const screensaver = new DemoScreensaver({ timeout: 10000, fadeDuration: 500 });
    (_a = document.getElementById('timeoutSlider')) === null || _a === void 0 ? void 0 : _a.addEventListener('input', (e) => {
        const target = e.target;
        const value = parseInt(target.value);
        const valueEl = document.getElementById('timeoutValue');
        if (valueEl)
            valueEl.textContent = String(value);
        screensaver.setTimeout(value * 1000);
        screensaver.log(`Timeout set to ${value}s`);
    });
    (_b = document.getElementById('fadeSlider')) === null || _b === void 0 ? void 0 : _b.addEventListener('input', (e) => {
        const target = e.target;
        const value = parseInt(target.value);
        const valueEl = document.getElementById('fadeValue');
        if (valueEl)
            valueEl.textContent = String(value);
        screensaver.setFadeDuration(value);
        screensaver.log(`Fade duration set to ${value}ms`);
    });
    window.forceActivate = () => screensaver.activate();
    window.forceDeactivate = () => {
        screensaver.deactivate();
        screensaver.resetTimeout();
    };
    window.resetDemo = () => {
        screensaver.resetEventCount();
        const activityLog = document.getElementById('activityLog');
        if (activityLog)
            activityLog.innerHTML = '<div class="entry">[--:--:--] Demo reset</div>';
        screensaver.deactivate();
        screensaver.resetTimeout();
    };
}
function initVideoOverlayDemo() {
    new DemoVideoOverlay();
}
function initDemoPage() {
    const path = window.location.pathname;
    if (path.includes('demo_draggable')) {
        initDraggableDemo();
    }
    else if (path.includes('demo_keyboard')) {
        initKeyboardDemo();
    }
    else if (path.includes('demo_gesture')) {
        initGestureDemo();
    }
    else if (path.includes('demo_screensaver')) {
        initScreensaverDemo();
    }
    else if (path.includes('demo_video_overlay')) {
        initVideoOverlayDemo();
    }
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDemoPage);
}
else {
    initDemoPage();
}
export { DemoDraggable, DemoGesture, DemoKeyboard, DemoScreensaver, DemoVideoOverlay, initDemoPage, initDraggableDemo, initGestureDemo, initKeyboardDemo, initScreensaverDemo, initVideoOverlayDemo };
//# sourceMappingURL=demo.js.map