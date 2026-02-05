// =============================================================================
// move.gl Demo Scripts
// =============================================================================
// Demo-specific JavaScript for interactive component demonstrations.
// These scripts are separate from the main library.
//
// This file contains:
// - Theme toggle functionality
// - Navigation dropdown functionality
// - Utility functions for demos
// - Demo page components (Draggable, Keyboard, Gesture, Screensaver, VideoOverlay)


// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------

type SwipeDirection = 'left' | 'right' | 'up' | 'down';
type DragEventType = 'start' | 'drag' | 'end';
type DragCallback = (type: DragEventType, elementId: string, x: number, y: number) => void;

interface KeyboardLayout {
    default: string[][];
    shift: string[][];
    special: string[][];
}

interface GestureStats {
    taps: number;
    swipes: number;
    pinches: number;
}

interface ScreensaverOptions {
    timeout?: number;
    fadeDuration?: number;
}

interface VideoOverlayOptions {
    opacity?: number;
    fadeDuration?: number;
    effect?: string;
}


// -----------------------------------------------------------------------------
// Theme Toggle
// -----------------------------------------------------------------------------

/**
 * Initialize theme toggle functionality.
 * Handles light/dark mode switching with localStorage persistence.
 */
function initThemeToggle(): void {
    const themeToggle = document.querySelector<HTMLButtonElement>('[data-toggle="theme"]');
    const html = document.documentElement;

    // Load saved theme or use system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    } else if (systemPrefersDark) {
        html.setAttribute('data-theme', 'dark');
    }

    // Handle theme toggle click
    themeToggle?.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}


// -----------------------------------------------------------------------------
// Navigation Dropdown
// -----------------------------------------------------------------------------

/**
 * Initialize navigation dropdown functionality.
 * Handles opening, closing, and keyboard navigation.
 */
function initNavDropdown(): void {
    const dropdown = document.getElementById('nav-dropdown');
    const toggle = dropdown?.querySelector<HTMLButtonElement>('.nav__dropdown-toggle');

    if (!dropdown || !toggle) return;

    // Toggle dropdown on click
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target as Node)) {
            dropdown.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Close dropdown on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dropdown.classList.contains('open')) {
            dropdown.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.focus();
        }
    });
}


// -----------------------------------------------------------------------------
// Tab Navigation
// -----------------------------------------------------------------------------

/**
 * Initialize tab navigation functionality.
 * Handles tab switching and content visibility.
 */
function initTabs(): void {
    const tabContainers = document.querySelectorAll<HTMLElement>('[data-tabs]');

    tabContainers.forEach((container) => {
        const tabs = container.querySelectorAll<HTMLButtonElement>('.tab');
        const contents = container.querySelectorAll<HTMLElement>('.tab-content');

        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                const targetId = tab.dataset.target;

                // Update active tab
                tabs.forEach((t) => t.classList.remove('active'));
                tab.classList.add('active');

                // Update visible content
                contents.forEach((content) => {
                    content.classList.toggle('active', content.id === targetId);
                });
            });
        });
    });
}


// -----------------------------------------------------------------------------
// Log Output
// -----------------------------------------------------------------------------

/**
 * Log output manager for demo panels.
 */
class LogOutput {
    private container: HTMLElement;
    private maxEntries: number;

    constructor(selector: string, maxEntries = 50) {
        const element = document.querySelector<HTMLElement>(selector);
        if (!element) {
            throw new Error(`Log output container not found: ${selector}`);
        }
        this.container = element;
        this.maxEntries = maxEntries;
    }

    /**
     * Add a log entry with timestamp.
     */
    log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
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

        // Remove old entries if exceeding max
        while (this.container.children.length > this.maxEntries) {
            this.container.removeChild(this.container.firstChild!);
        }

        // Scroll to bottom
        this.container.scrollTop = this.container.scrollHeight;
    }

    /**
     * Clear all log entries.
     */
    clear(): void {
        this.container.innerHTML = '';
    }
}


// -----------------------------------------------------------------------------
// Utility Functions
// -----------------------------------------------------------------------------

/**
 * Format a number with units (e.g., "1.5s", "100px").
 */
function formatValue(value: number, unit: string): string {
    return `${value}${unit}`;
}

/**
 * Debounce function for rate-limiting.
 */
function debounce<T extends (...args: unknown[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Throttle function for rate-limiting.
 */
function throttle<T extends (...args: unknown[]) => void>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}


// -----------------------------------------------------------------------------
// Initialize on DOM Ready
// -----------------------------------------------------------------------------

function initDemo(): void {
    initThemeToggle();
    initNavDropdown();
    initTabs();
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDemo);
} else {
    initDemo();
}


// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export {
    debounce, formatValue, initNavDropdown,
    initTabs, initThemeToggle, LogOutput, throttle
};


// -----------------------------------------------------------------------------
// Demo: Draggable
// -----------------------------------------------------------------------------

/**
 * Demo implementation of draggable functionality.
 * For production use, import Draggable from the main library.
 */
class DemoDraggable {
    private element: HTMLElement | null;
    private isDragging = false;
    private startX = 0;
    private startY = 0;
    private onDrag: DragCallback | undefined;
    private boundRect: DOMRect | undefined;

    constructor(elementId: string, onDrag?: DragCallback) {
        this.element = document.getElementById(elementId);
        this.onDrag = onDrag;

        if (this.element?.parentElement) {
            this.boundRect = this.element.parentElement.getBoundingClientRect();
            this.attachEventListeners();
        }
    }

    private attachEventListeners(): void {
        if (!this.element) return;

        this.element.addEventListener('mousedown', this.startDrag.bind(this));
        this.element.addEventListener('touchstart', this.startDrag.bind(this), { passive: false });
        document.addEventListener('mouseup', this.stopDrag.bind(this));
        document.addEventListener('touchend', this.stopDrag.bind(this));
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('touchmove', this.drag.bind(this), { passive: false });
    }

    private getCoords(event: MouseEvent | TouchEvent): { clientX: number; clientY: number } {
        if ('touches' in event && event.touches.length > 0) {
            return { clientX: event.touches[0].clientX, clientY: event.touches[0].clientY };
        }
        return { clientX: (event as MouseEvent).clientX, clientY: (event as MouseEvent).clientY };
    }

    private startDrag(event: MouseEvent | TouchEvent): void {
        if (!this.element) return;
        event.preventDefault();
        const coords = this.getCoords(event);
        this.isDragging = true;
        this.startX = coords.clientX - this.element.offsetLeft;
        this.startY = coords.clientY - this.element.offsetTop;
        this.onDrag?.('start', this.element.id, coords.clientX, coords.clientY);
    }

    private stopDrag(event: MouseEvent | TouchEvent): void {
        if (this.isDragging && this.element) {
            this.isDragging = false;
            const coords = this.getCoords(event);
            this.onDrag?.('end', this.element.id, coords.clientX || 0, coords.clientY || 0);
        }
    }

    private drag(event: MouseEvent | TouchEvent): void {
        if (!this.isDragging || !this.element?.parentElement) return;
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

        this.onDrag?.('drag', this.element.id, Math.round(newX), Math.round(newY));
    }
}


// -----------------------------------------------------------------------------
// Demo: Virtual Keyboard
// -----------------------------------------------------------------------------

/**
 * Demo virtual keyboard with customizable layouts.
 */
class DemoKeyboard {
    private layouts: KeyboardLayout = {
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

    private currentMode: keyof KeyboardLayout = 'default';
    private stats = { chars: 0, words: 0, keys: 0 };
    private input: HTMLInputElement | null;
    private container: HTMLElement | null;

    constructor(inputId: string, containerId: string) {
        this.input = document.getElementById(inputId) as HTMLInputElement;
        this.container = document.getElementById(containerId);
        this.render();
    }

    private render(): void {
        if (!this.container) return;

        const layout = this.layouts[this.currentMode];
        this.container.innerHTML = layout.map(row =>
            `<div class="keyboard-row">${row.map(key => {
                let cls = 'key';
                if (key === ' ') cls += ' key--space';
                if (key === '⇧') cls += ' key--shift';
                if (key === '⌫') cls += ' key--backspace';
                if (key === '↵') cls += ' key--enter';
                if (key === '123' || key === 'ABC') cls += ' key--mode';
                return `<button class="${cls}" data-key="${key}">${key === ' ' ? 'space' : key}</button>`;
            }).join('')}</div>`
        ).join('');

        this.container.querySelectorAll<HTMLButtonElement>('.key').forEach(btn => {
            btn.addEventListener('click', () => this.handleKey(btn.dataset.key ?? ''));
        });
    }

    private handleKey(key: string): void {
        if (!this.input) return;

        this.stats.keys++;

        if (key === '⌫') {
            this.input.value = this.input.value.slice(0, -1);
        } else if (key === '↵') {
            this.input.value += '\n';
        } else if (key === '⇧') {
            this.switchMode(this.currentMode === 'shift' ? 'default' : 'shift');
            return;
        } else if (key === '123') {
            this.switchMode('special');
            return;
        } else if (key === 'ABC') {
            this.switchMode('default');
            return;
        } else {
            this.input.value += key;
            this.stats.chars++;
        }

        this.stats.words = this.input.value.trim().split(/\s+/).filter(w => w).length;
        this.updateStats();
    }

    switchMode(mode: keyof KeyboardLayout): void {
        this.currentMode = mode;
        this.render();
        document.querySelectorAll<HTMLButtonElement>('.mode-btn').forEach(btn => {
            btn.classList.toggle('active',
                (mode === 'default' && btn.textContent === 'ABC') ||
                (mode === 'shift' && btn.textContent?.includes('SHIFT')) ||
                (mode === 'special' && btn.textContent === '123')
            );
        });
    }

    private updateStats(): void {
        const charEl = document.getElementById('charCount');
        const wordEl = document.getElementById('wordCount');
        const keyEl = document.getElementById('keypressCount');
        if (charEl) charEl.textContent = String(this.stats.chars);
        if (wordEl) wordEl.textContent = String(this.stats.words);
        if (keyEl) keyEl.textContent = String(this.stats.keys);
    }

    getStats(): typeof this.stats {
        return { ...this.stats };
    }
}


// -----------------------------------------------------------------------------
// Demo: Gesture Handler
// -----------------------------------------------------------------------------

/**
 * Demo gesture handler for touch and mouse interactions.
 */
class DemoGesture {
    private element: HTMLElement | null;
    private stats: GestureStats = { taps: 0, swipes: 0, pinches: 0 };
    private startX = 0;
    private startY = 0;
    private startTime = 0;
    private isDragging = false;

    constructor(elementId: string) {
        this.element = document.getElementById(elementId);
        if (this.element) {
            this.attachEventListeners();
        }
    }

    private attachEventListeners(): void {
        if (!this.element) return;

        // Mouse events
        this.element.addEventListener('mousedown', (e) => this.handleStart(e.clientX, e.clientY));
        document.addEventListener('mouseup', (e) => this.handleEnd(e.clientX, e.clientY));

        // Touch events
        this.element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                this.handleStart(e.touches[0].clientX, e.touches[0].clientY);
            } else if (e.touches.length === 2) {
                this.handlePinch();
            }
        });

        this.element.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 1) {
                this.handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            }
        });
    }

    private handleStart(x: number, y: number): void {
        this.startX = x;
        this.startY = y;
        this.startTime = Date.now();
        this.isDragging = true;
    }

    private handleEnd(x: number, y: number): void {
        if (!this.isDragging) return;
        this.isDragging = false;

        const dx = x - this.startX;
        const dy = y - this.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const duration = Date.now() - this.startTime;

        if (dist < 10 && duration < 300) {
            this.handleTap();
        } else if (dist > 50) {
            const direction = this.getSwipeDirection(dx, dy);
            this.handleSwipe(direction, dx, dy);
        }
    }

    private getSwipeDirection(dx: number, dy: number): SwipeDirection {
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 'right' : 'left';
        }
        return dy > 0 ? 'down' : 'up';
    }

    private handleTap(): void {
        this.stats.taps++;
        this.updateUI('tap');
    }

    private handleSwipe(direction: SwipeDirection, _dx: number, _dy: number): void {
        this.stats.swipes++;
        this.updateUI('swipe', direction);
    }

    private handlePinch(): void {
        this.stats.pinches++;
        this.updateUI('pinch');
    }

    private updateUI(type: string, direction?: SwipeDirection): void {
        const tapCount = document.getElementById('tapCount');
        const swipeCount = document.getElementById('swipeCount');
        const pinchCount = document.getElementById('pinchCount');
        const lastDirection = document.getElementById('lastDirection');

        if (tapCount) tapCount.textContent = String(this.stats.taps);
        if (swipeCount) swipeCount.textContent = String(this.stats.swipes);
        if (pinchCount) pinchCount.textContent = String(this.stats.pinches);
        if (direction && lastDirection) lastDirection.textContent = direction;

        // Show feedback
        const feedback = document.getElementById('gestureFeedback');
        if (feedback) {
            feedback.textContent = type === 'swipe' ? `Swiped ${direction}!` : `${type.charAt(0).toUpperCase() + type.slice(1)} detected!`;
            feedback.classList.add('visible');
            setTimeout(() => feedback.classList.remove('visible'), 1500);
        }

        // Show direction indicator
        if (direction) {
            this.showDirectionIndicator(direction);
        }
    }

    private showDirectionIndicator(direction: SwipeDirection): void {
        document.querySelectorAll('.direction-indicator').forEach(el => el.classList.remove('active'));
        const indicator = document.getElementById(`dir${direction.charAt(0).toUpperCase() + direction.slice(1)}`);
        if (indicator) {
            indicator.classList.add('active');
            setTimeout(() => indicator.classList.remove('active'), 300);
        }
    }

    resetStats(): void {
        this.stats = { taps: 0, swipes: 0, pinches: 0 };
        this.updateUI('reset');
        const lastDirection = document.getElementById('lastDirection');
        if (lastDirection) lastDirection.textContent = '—';
    }
}


// -----------------------------------------------------------------------------
// Demo: Screensaver
// -----------------------------------------------------------------------------

/**
 * Demo screensaver with inactivity detection.
 */
class DemoScreensaver {
    private timeout: number;
    private fadeDuration: number;
    private isActive = false;
    private timeoutId: ReturnType<typeof setTimeout> | null = null;
    private lastActivity: number;
    private eventCount = 0;

    private screensaverContent: HTMLElement | null;
    private placeholder: HTMLElement | null;
    private statusDot: HTMLElement | null;
    private statusText: HTMLElement | null;
    private countdown: HTMLElement | null;
    private activityLog: HTMLElement | null;

    constructor(options: ScreensaverOptions = {}) {
        this.timeout = options.timeout ?? 10000;
        this.fadeDuration = options.fadeDuration ?? 500;
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

    private setupEventListeners(): void {
        ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
            document.addEventListener(event, () => this.resetTimeout(), { passive: true });
        });
    }

    log(message: string): void {
        if (!this.activityLog) return;
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'entry';
        entry.textContent = `[${time}] ${message}`;
        this.activityLog.appendChild(entry);
        this.activityLog.scrollTop = this.activityLog.scrollHeight;
    }

    resetTimeout(): void {
        if (this.isActive) this.deactivate();
        this.lastActivity = Date.now();
        this.eventCount++;
        const eventCountEl = document.getElementById('eventCount');
        if (eventCountEl) eventCountEl.textContent = String(this.eventCount);
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.startTimeout();
    }

    private startTimeout(): void {
        this.timeoutId = setTimeout(() => this.activate(), this.timeout);
    }

    private updateCountdown(): void {
        setInterval(() => {
            if (!this.isActive && this.countdown) {
                const elapsed = Date.now() - this.lastActivity;
                const remaining = Math.max(0, Math.ceil((this.timeout - elapsed) / 1000));
                this.countdown.textContent = `${remaining}s`;
            }
        }, 100);
    }

    activate(): void {
        this.isActive = true;
        this.screensaverContent?.classList.add('active');
        if (this.placeholder) this.placeholder.style.opacity = '0';
        this.statusDot?.classList.add('screensaver-active');
        if (this.statusText) this.statusText.textContent = 'Screensaver active';
        if (this.countdown) this.countdown.textContent = '💤';
        this.log('Screensaver activated');
    }

    deactivate(): void {
        this.isActive = false;
        this.screensaverContent?.classList.remove('active');
        if (this.placeholder) this.placeholder.style.opacity = '1';
        this.statusDot?.classList.remove('screensaver-active');
        if (this.statusText) this.statusText.textContent = 'Monitoring activity';
        this.log('Screensaver deactivated');
    }

    setTimeout(timeout: number): void {
        this.timeout = timeout;
        this.resetTimeout();
    }

    setFadeDuration(duration: number): void {
        this.fadeDuration = duration;
        if (this.screensaverContent) {
            this.screensaverContent.style.transition = `opacity ${duration}ms ease`;
        }
    }

    getEventCount(): number {
        return this.eventCount;
    }

    resetEventCount(): void {
        this.eventCount = 0;
        const eventCountEl = document.getElementById('eventCount');
        if (eventCountEl) eventCountEl.textContent = '0';
    }
}


// -----------------------------------------------------------------------------
// Demo: Video Overlay
// -----------------------------------------------------------------------------

/**
 * Demo video overlay with visual effects.
 */
class DemoVideoOverlay {
    private overlay: HTMLElement | null;
    private particles: HTMLElement | null;
    private isVisible = false;
    private currentEffect = 'vignette';
    private opacity = 1;
    private fadeDuration = 300;
    private blurAmount = 0;

    constructor() {
        this.overlay = document.getElementById('videoOverlay');
        this.particles = document.getElementById('particles');

        this.checkHevcSupport();
        this.setupControls();
        this.createParticles();
    }

    private checkHevcSupport(): void {
        const indicator = document.getElementById('alphaIndicator');
        if (!indicator) return;

        const video = document.createElement('video');
        const canPlayHevc = video.canPlayType('video/mp4; codecs="hvc1"') !== '';

        if (canPlayHevc) {
            indicator.className = 'alpha-indicator supported';
            indicator.textContent = '✓ HEVC Supported';
        } else {
            indicator.className = 'alpha-indicator unsupported';
            indicator.textContent = '✗ HEVC Not Supported';
        }
    }

    private setupControls(): void {
        document.getElementById('opacitySlider')?.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            this.opacity = parseInt(target.value) / 100;
            const valueEl = document.getElementById('opacityValue');
            if (valueEl) valueEl.textContent = `${target.value}%`;
            if (this.isVisible && this.overlay) this.overlay.style.opacity = String(this.opacity);
        });

        document.getElementById('fadeSlider')?.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            this.fadeDuration = parseInt(target.value);
            const valueEl = document.getElementById('fadeValue');
            if (valueEl) valueEl.textContent = target.value;
            if (this.overlay) this.overlay.style.transition = `opacity ${this.fadeDuration}ms ease`;
        });

        document.getElementById('blurSlider')?.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            this.blurAmount = parseInt(target.value);
            const valueEl = document.getElementById('blurValue');
            if (valueEl) valueEl.textContent = target.value;
            if (this.overlay) {
                this.overlay.style.backdropFilter = this.blurAmount > 0 ? `blur(${this.blurAmount}px)` : 'none';
            }
        });

        document.querySelectorAll<HTMLButtonElement>('.effect-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.effect-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setEffect(btn.dataset.effect ?? 'none');
            });
        });

        document.getElementById('toggleOverlay')?.addEventListener('click', () => this.toggle());
        document.getElementById('fadeInOut')?.addEventListener('click', () => this.fadeInOut());
        document.getElementById('resetDemo')?.addEventListener('click', () => this.reset());
    }

    private createParticles(): void {
        if (!this.particles) return;

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

    setEffect(effect: string): void {
        this.currentEffect = effect;
        const overlayEffect = this.overlay?.querySelector<HTMLElement>('.overlay-effect');
        if (!overlayEffect || !this.particles) return;

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

    toggle(): void {
        this.isVisible = !this.isVisible;
        this.overlay?.classList.toggle('visible', this.isVisible);
        if (this.isVisible && this.overlay) this.overlay.style.opacity = String(this.opacity);
        const toggleBtn = document.getElementById('toggleOverlay');
        if (toggleBtn) toggleBtn.textContent = this.isVisible ? 'Hide Overlay' : 'Show Overlay';
    }

    fadeInOut(): void {
        if (!this.isVisible) {
            this.toggle();
            setTimeout(() => this.toggle(), this.fadeDuration * 3);
        }
    }

    reset(): void {
        this.isVisible = false;
        this.overlay?.classList.remove('visible');
        const toggleBtn = document.getElementById('toggleOverlay');
        if (toggleBtn) toggleBtn.textContent = 'Show Overlay';

        const opacitySlider = document.getElementById('opacitySlider') as HTMLInputElement;
        const opacityValue = document.getElementById('opacityValue');
        const fadeSlider = document.getElementById('fadeSlider') as HTMLInputElement;
        const fadeValue = document.getElementById('fadeValue');
        const blurSlider = document.getElementById('blurSlider') as HTMLInputElement;
        const blurValue = document.getElementById('blurValue');

        if (opacitySlider) opacitySlider.value = '100';
        if (opacityValue) opacityValue.textContent = '100%';
        if (fadeSlider) fadeSlider.value = '300';
        if (fadeValue) fadeValue.textContent = '300';
        if (blurSlider) blurSlider.value = '0';
        if (blurValue) blurValue.textContent = '0';

        this.opacity = 1;
        this.fadeDuration = 300;
        this.blurAmount = 0;

        if (this.overlay) {
            this.overlay.style.transition = 'opacity 300ms ease';
            this.overlay.style.backdropFilter = 'none';
        }
    }
}


// -----------------------------------------------------------------------------
// Demo Page Initializers
// -----------------------------------------------------------------------------

/**
 * Initialize the draggable demo page.
 */
function initDraggableDemo(): void {
    const logOutput = document.getElementById('logOutput');

    function log(message: string): void {
        if (!logOutput) return;
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `<span class="timestamp">[${time}]</span> ${message}`;
        logOutput.appendChild(entry);
        logOutput.scrollTop = logOutput.scrollHeight;
    }

    function handleDrag(type: DragEventType, id: string, x: number, y: number): void {
        if (type === 'start') {
            log(`<strong>${id}</strong>: Drag started`);
        } else if (type === 'end') {
            log(`<strong>${id}</strong>: Drag ended`);
        } else {
            log(`<strong>${id}</strong>: Position (${x}, ${y})`);
        }
    }

    // Initialize draggable boxes
    new DemoDraggable('box1', handleDrag);
    new DemoDraggable('box2', handleDrag);
    new DemoDraggable('box3', handleDrag);

    // Global functions for buttons
    (window as unknown as Record<string, () => void>).resetPositions = () => {
        const box1 = document.getElementById('box1');
        const box2 = document.getElementById('box2');
        const box3 = document.getElementById('box3');
        if (box1) box1.style.cssText = 'top: 50px; left: 50px;';
        if (box2) box2.style.cssText = 'top: 50px; right: 50px;';
        if (box3) box3.style.cssText = 'bottom: 50px; left: 50%; transform: translateX(-50%);';
        log('Positions reset');
    };

    (window as unknown as Record<string, () => void>).clearLog = () => {
        if (logOutput) {
            logOutput.innerHTML = '<div class="log-entry"><span class="timestamp">[--:--:--]</span> Log cleared</div>';
        }
    };

    log('Draggable demo initialized. Try dragging the boxes!');
}

/**
 * Initialize the keyboard demo page.
 */
function initKeyboardDemo(): void {
    const keyboard = new DemoKeyboard('keyboardInput', 'keyboard');

    (window as unknown as Record<string, (mode: string) => void>).switchMode = (mode: string) => {
        keyboard.switchMode(mode as keyof KeyboardLayout);
    };
}

/**
 * Initialize the gesture demo page.
 */
function initGestureDemo(): void {
    const gesture = new DemoGesture('gestureArea');

    function log(type: string, details: string): void {
        const gestureLog = document.getElementById('gestureLog');
        if (!gestureLog) return;
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'entry';
        entry.innerHTML = `<span class="timestamp">${time}</span><span class="type">${type}</span><span class="details">${details}</span>`;
        gestureLog.appendChild(entry);
        gestureLog.scrollTop = gestureLog.scrollHeight;
    }

    (window as unknown as Record<string, () => void>).resetStats = () => {
        gesture.resetStats();
        log('RESET', 'Stats cleared');
    };

    (window as unknown as Record<string, () => void>).clearLog = () => {
        const gestureLog = document.getElementById('gestureLog');
        if (gestureLog) {
            gestureLog.innerHTML = '<div class="entry"><span class="timestamp">--:--:--</span><span class="type">INIT</span><span class="details">Log cleared</span></div>';
        }
    };

    log('READY', 'Gesture handler initialized');
}

/**
 * Initialize the screensaver demo page.
 */
function initScreensaverDemo(): void {
    const screensaver = new DemoScreensaver({ timeout: 10000, fadeDuration: 500 });

    document.getElementById('timeoutSlider')?.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const value = parseInt(target.value);
        const valueEl = document.getElementById('timeoutValue');
        if (valueEl) valueEl.textContent = String(value);
        screensaver.setTimeout(value * 1000);
        screensaver.log(`Timeout set to ${value}s`);
    });

    document.getElementById('fadeSlider')?.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const value = parseInt(target.value);
        const valueEl = document.getElementById('fadeValue');
        if (valueEl) valueEl.textContent = String(value);
        screensaver.setFadeDuration(value);
        screensaver.log(`Fade duration set to ${value}ms`);
    });

    (window as unknown as Record<string, () => void>).forceActivate = () => screensaver.activate();
    (window as unknown as Record<string, () => void>).forceDeactivate = () => {
        screensaver.deactivate();
        screensaver.resetTimeout();
    };
    (window as unknown as Record<string, () => void>).resetDemo = () => {
        screensaver.resetEventCount();
        const activityLog = document.getElementById('activityLog');
        if (activityLog) activityLog.innerHTML = '<div class="entry">[--:--:--] Demo reset</div>';
        screensaver.deactivate();
        screensaver.resetTimeout();
    };
}

/**
 * Initialize the video overlay demo page.
 */
function initVideoOverlayDemo(): void {
    new DemoVideoOverlay();
}


// -----------------------------------------------------------------------------
// Auto-Detection and Initialization
// -----------------------------------------------------------------------------

/**
 * Detect which demo page is loaded and initialize accordingly.
 */
function initDemoPage(): void {
    const path = window.location.pathname;

    if (path.includes('demo_draggable')) {
        initDraggableDemo();
    } else if (path.includes('demo_keyboard')) {
        initKeyboardDemo();
    } else if (path.includes('demo_gesture')) {
        initGestureDemo();
    } else if (path.includes('demo_screensaver')) {
        initScreensaverDemo();
    } else if (path.includes('demo_video_overlay')) {
        initVideoOverlayDemo();
    }
}

// Auto-initialize demo pages
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDemoPage);
} else {
    initDemoPage();
}


// -----------------------------------------------------------------------------
// Demo Class Exports
// -----------------------------------------------------------------------------

export {
    DemoDraggable,
    DemoGesture,
    DemoKeyboard,
    DemoScreensaver,
    DemoVideoOverlay,
    initDemoPage,
    initDraggableDemo,
    initGestureDemo,
    initKeyboardDemo,
    initScreensaverDemo,
    initVideoOverlayDemo
};
