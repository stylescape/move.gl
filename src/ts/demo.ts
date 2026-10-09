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
 * Read the saved theme. localStorage can throw (blocked storage, some
 * private modes), which must not abort the rest of the demo initialization.
 */
function getSavedTheme(): string | null {
    try {
        const theme = localStorage.getItem('theme');
        return theme === 'dark' || theme === 'light' ? theme : null;
    } catch {
        return null;
    }
}

function saveTheme(theme: string): void {
    try {
        localStorage.setItem('theme', theme);
    } catch {
        // Storage unavailable; the theme still applies for this page view.
    }
}

/**
 * Initialize theme toggle functionality.
 * Handles light/dark mode switching with localStorage persistence.
 */
function initThemeToggle(): void {
    const themeToggle = document.querySelector<HTMLButtonElement>('[data-toggle="theme"]');
    const html = document.documentElement;
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (theme: string): void => {
        html.setAttribute('data-theme', theme);
        themeToggle?.setAttribute('aria-pressed', String(theme === 'dark'));
    };

    // Load saved theme or use system preference
    applyTheme(getSavedTheme() ?? (darkQuery.matches ? 'dark' : 'light'));

    // Handle theme toggle click
    themeToggle?.addEventListener('click', () => {
        const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        saveTheme(newTheme);
    });

    // Listen for system theme changes
    darkQuery.addEventListener('change', (e) => {
        if (!getSavedTheme()) {
            applyTheme(e.matches ? 'dark' : 'light');
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
    const toggle = dropdown?.querySelector<HTMLButtonElement>('[data-toggle="nav-dropdown"]');
    const menu = document.getElementById('nav-dropdown-menu');

    if (!dropdown || !toggle || !menu) return;

    const setOpen = (open: boolean): void => {
        menu.hidden = !open;
        toggle.setAttribute('aria-expanded', String(open));
    };

    // Toggle dropdown on click
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target as Node)) setOpen(false);
    });

    // Close dropdown when keyboard focus leaves it (e.g. tabbing past the last link)
    dropdown.addEventListener('focusout', (e) => {
        const next = e.relatedTarget as Node | null;
        if (next && !dropdown.contains(next)) setOpen(false);
    });

    // Close dropdown on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !menu.hidden) {
            setOpen(false);
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
        entry.dataset.type = type;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;

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
 * Append a log entry and keep the log bounded, scrolled to the newest entry.
 */
function appendLogEntry(container: HTMLElement, entry: HTMLElement, maxEntries = 50): void {
    container.appendChild(entry);
    while (container.children.length > maxEntries) {
        container.removeChild(container.firstElementChild!);
    }
    container.scrollTop = container.scrollHeight;
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
    private initialStyle = '';

    private readonly handleStart = (e: MouseEvent | TouchEvent): void => this.startDrag(e);
    private readonly handleMove = (e: MouseEvent | TouchEvent): void => this.drag(e);
    private readonly handleEnd = (e: MouseEvent | TouchEvent): void => this.stopDrag(e);

    constructor(elementId: string, onDrag?: DragCallback) {
        this.element = document.getElementById(elementId);
        this.onDrag = onDrag;

        if (this.element?.parentElement) {
            this.initialStyle = this.element.style.cssText;
            this.attachEventListeners();
        }
    }

    private attachEventListeners(): void {
        if (!this.element) return;

        this.element.addEventListener('mousedown', this.handleStart);
        this.element.addEventListener('touchstart', this.handleStart, { passive: false });
        document.addEventListener('mouseup', this.handleEnd);
        document.addEventListener('touchend', this.handleEnd);
        document.addEventListener('touchcancel', this.handleEnd);
        document.addEventListener('mousemove', this.handleMove);
        document.addEventListener('touchmove', this.handleMove, { passive: false });
    }

    private getCoords(event: MouseEvent | TouchEvent): { clientX: number; clientY: number } {
        if ('touches' in event) {
            // touchend/touchcancel have no active touches; use the lifted one
            const touch = event.touches[0] ?? event.changedTouches[0];
            return { clientX: touch?.clientX ?? 0, clientY: touch?.clientY ?? 0 };
        }
        return { clientX: event.clientX, clientY: event.clientY };
    }

    private startDrag(event: MouseEvent | TouchEvent): void {
        if (!this.element?.parentElement) return;
        // Only drag with the primary mouse button
        if (!('touches' in event) && event.button !== 0) return;
        event.preventDefault();

        // Measure the rendered position (including any CSS transform such as
        // translateX(-50%)) relative to the container's padding box, then pin
        // the element there with left/top so it does not jump on first move.
        const parent = this.element.parentElement;
        const rect = this.element.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        const left = rect.left - parentRect.left - parent.clientLeft;
        const top = rect.top - parentRect.top - parent.clientTop;
        this.setPosition(left, top);

        const coords = this.getCoords(event);
        this.isDragging = true;
        this.startX = coords.clientX - left;
        this.startY = coords.clientY - top;
        this.onDrag?.('start', this.element.id, coords.clientX, coords.clientY);
    }

    private stopDrag(event: MouseEvent | TouchEvent): void {
        if (this.isDragging && this.element) {
            this.isDragging = false;
            const coords = this.getCoords(event);
            this.onDrag?.('end', this.element.id, coords.clientX, coords.clientY);
        }
    }

    private drag(event: MouseEvent | TouchEvent): void {
        if (!this.isDragging || !this.element?.parentElement) return;
        event.preventDefault();

        const coords = this.getCoords(event);
        const parent = this.element.parentElement;

        // clientWidth/clientHeight exclude the container border, so the
        // element cannot be pushed under it.
        const maxX = parent.clientWidth - this.element.offsetWidth;
        const maxY = parent.clientHeight - this.element.offsetHeight;
        const newX = Math.max(0, Math.min(coords.clientX - this.startX, maxX));
        const newY = Math.max(0, Math.min(coords.clientY - this.startY, maxY));

        this.setPosition(newX, newY);
        this.onDrag?.('drag', this.element.id, Math.round(newX), Math.round(newY));
    }

    private setPosition(x: number, y: number): void {
        if (!this.element) return;
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        this.element.style.right = 'auto';
        this.element.style.bottom = 'auto';
        this.element.style.transform = 'none';
    }

    /**
     * Restore the element's original inline position and size.
     */
    reset(): void {
        this.isDragging = false;
        if (this.element) this.element.style.cssText = this.initialStyle;
    }

    destroy(): void {
        this.element?.removeEventListener('mousedown', this.handleStart);
        this.element?.removeEventListener('touchstart', this.handleStart);
        document.removeEventListener('mouseup', this.handleEnd);
        document.removeEventListener('touchend', this.handleEnd);
        document.removeEventListener('touchcancel', this.handleEnd);
        document.removeEventListener('mousemove', this.handleMove);
        document.removeEventListener('touchmove', this.handleMove);
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
    private input: HTMLInputElement | HTMLTextAreaElement | null;
    private container: HTMLElement | null;

    private static readonly keyLabels: Record<string, string> = {
        ' ': 'Space',
        '⇧': 'Shift',
        '⌫': 'Backspace',
        '↵': 'Enter',
        '123': 'Numbers and symbols',
        'ABC': 'Letters'
    };

    constructor(inputId: string, containerId: string) {
        this.input = document.getElementById(inputId) as HTMLInputElement | HTMLTextAreaElement | null;
        this.container = document.getElementById(containerId);

        // One delegated listener survives re-renders of the key buttons
        this.container?.addEventListener('click', (e) => {
            const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.key');
            if (btn && this.container?.contains(btn)) this.handleKey(btn.dataset.key ?? '');
        });

        this.render();
    }

    private render(): void {
        if (!this.container) return;

        // Build with DOM APIs: keys such as '"' would break an HTML string
        const rows = this.layouts[this.currentMode].map(row => {
            const rowEl = document.createElement('div');
            rowEl.className = 'ss-u-flex ss-u-flex-wrap ss-u-justify-center ss-u-gap-6';
            row.forEach(key => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'ss-c-kbd ss-c-kbd--lg';
                btn.dataset.key = key;
                btn.textContent = key === ' ' ? 'space' : key;
                const label = DemoKeyboard.keyLabels[key];
                if (label) btn.setAttribute('aria-label', label);
                if (key === '⇧') btn.setAttribute('aria-pressed', String(this.currentMode === 'shift'));
                rowEl.appendChild(btn);
            });
            return rowEl;
        });

        this.container.replaceChildren(...rows);
    }

    private handleKey(key: string): void {
        if (!this.input) return;

        this.stats.keys++;

        if (key === '⌫') {
            this.input.value = this.input.value.slice(0, -1);
        } else if (key === '↵') {
            // A single-line <input> silently drops line breaks
            if (this.input instanceof HTMLTextAreaElement) this.input.value += '\n';
        } else if (key === '⇧') {
            this.switchMode(this.currentMode === 'shift' ? 'default' : 'shift');
        } else if (key === '123') {
            this.switchMode('special');
        } else if (key === 'ABC') {
            this.switchMode('default');
        } else {
            this.input.value += key;
        }

        this.stats.chars = this.input.value.length;
        this.stats.words = this.input.value.trim().split(/\s+/).filter(w => w).length;
        this.updateStats();
    }

    switchMode(mode: keyof KeyboardLayout): void {
        if (!(mode in this.layouts)) return;
        this.currentMode = mode;
        this.render();
        document.querySelectorAll<HTMLButtonElement>('.mode-btn').forEach(btn => {
            const isActive = btn.dataset.mode === mode;
            btn.classList.toggle('ss-c-button--primary', isActive);
            btn.classList.toggle('ss-c-button--outline', !isActive);
            btn.setAttribute('aria-pressed', String(isActive));
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
    private feedbackTimer: ReturnType<typeof setTimeout> | null = null;
    private indicatorTimer: ReturnType<typeof setTimeout> | null = null;
    private onGesture: ((type: string, details: string) => void) | undefined;

    constructor(elementId: string, onGesture?: (type: string, details: string) => void) {
        this.element = document.getElementById(elementId);
        this.onGesture = onGesture;
        if (this.element) {
            this.attachEventListeners();
        }
    }

    private attachEventListeners(): void {
        if (!this.element) return;

        // Mouse events
        this.element.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.handleStart(e.clientX, e.clientY);
        });
        document.addEventListener('mouseup', (e) => this.handleEnd(e.clientX, e.clientY));

        // Touch events
        this.element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                this.handleStart(e.touches[0].clientX, e.touches[0].clientY);
            } else if (e.touches.length === 2) {
                this.handlePinch();
            }
        }, { passive: false });

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
        this.updateCounters();
        this.showFeedback('Tap detected!');
        this.onGesture?.('TAP', `at (${Math.round(this.startX)}, ${Math.round(this.startY)})`);
    }

    private handleSwipe(direction: SwipeDirection, dx: number, dy: number): void {
        this.stats.swipes++;
        this.updateCounters();
        const lastDirection = document.getElementById('lastDirection');
        if (lastDirection) lastDirection.textContent = direction;
        this.showFeedback(`Swiped ${direction}!`);
        this.showDirectionIndicator(direction);
        this.onGesture?.('SWIPE', `${direction} (Δx ${Math.round(dx)}, Δy ${Math.round(dy)})`);
    }

    private handlePinch(): void {
        // The second finger turns this into a pinch; lifting the fingers
        // afterwards must not also register as a tap or swipe.
        this.isDragging = false;
        this.stats.pinches++;
        this.updateCounters();
        this.showFeedback('Pinch detected!');
        this.onGesture?.('PINCH', 'Two-finger touch');
    }

    private updateCounters(): void {
        const tapCount = document.getElementById('tapCount');
        const swipeCount = document.getElementById('swipeCount');
        const pinchCount = document.getElementById('pinchCount');

        if (tapCount) tapCount.textContent = String(this.stats.taps);
        if (swipeCount) swipeCount.textContent = String(this.stats.swipes);
        if (pinchCount) pinchCount.textContent = String(this.stats.pinches);
    }

    private showFeedback(message: string): void {
        const feedback = document.getElementById('gestureFeedback');
        if (!feedback) return;
        feedback.textContent = message;
        feedback.classList.add('visible');
        // Restart the hide timer so rapid gestures don't hide the newest message early
        if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
        this.feedbackTimer = setTimeout(() => feedback.classList.remove('visible'), 1500);
    }

    private showDirectionIndicator(direction: SwipeDirection): void {
        document.querySelectorAll('.direction-indicator').forEach(el => el.classList.remove('active'));
        const indicator = document.getElementById(`dir${direction.charAt(0).toUpperCase() + direction.slice(1)}`);
        if (indicator) {
            indicator.classList.add('active');
            if (this.indicatorTimer) clearTimeout(this.indicatorTimer);
            this.indicatorTimer = setTimeout(() => indicator.classList.remove('active'), 300);
        }
    }

    resetStats(): void {
        this.stats = { taps: 0, swipes: 0, pinches: 0 };
        this.updateCounters();
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

        this.setFadeDuration(this.fadeDuration);
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
        entry.textContent = `[${time}] ${message}`;
        appendLogEntry(this.activityLog, entry);
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
        if (this.isActive) return;
        // A forced activation must not be followed by the pending timer firing again
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.timeoutId = null;
        this.isActive = true;
        this.screensaverContent?.classList.add('active');
        if (this.placeholder) this.placeholder.style.opacity = '0';
        this.statusDot?.classList.add('screensaver-active');
        if (this.statusText) this.statusText.textContent = 'Screensaver active';
        if (this.countdown) this.countdown.textContent = 'Zz';
        this.log('Screensaver activated');
    }

    deactivate(): void {
        if (!this.isActive) return;
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
        const transition = `opacity ${duration}ms ease`;
        if (this.screensaverContent) this.screensaverContent.style.transition = transition;
        if (this.placeholder) this.placeholder.style.transition = transition;
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
    private fadeTimer: ReturnType<typeof setTimeout> | null = null;

    constructor() {
        this.overlay = document.getElementById('videoOverlay');
        this.particles = document.getElementById('particles');

        this.checkHevcSupport();
        this.setupControls();
        this.createParticles();
        this.setEffect(this.currentEffect);
    }

    private checkHevcSupport(): void {
        const indicator = document.getElementById('alphaIndicator');
        if (!indicator) return;

        const video = document.createElement('video');
        const canPlayHevc = video.canPlayType('video/mp4; codecs="hvc1"') !== '';

        if (canPlayHevc) {
            indicator.className = 'ss-c-badge ss-c-badge--sm ss-c-badge--success';
            indicator.textContent = '✓ HEVC Supported';
        } else {
            indicator.className = 'ss-c-badge ss-c-badge--sm ss-c-badge--error';
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
            btn.addEventListener('click', () => this.setEffect(btn.dataset.effect ?? 'none'));
        });

        document.getElementById('toggleOverlay')?.addEventListener('click', () => {
            this.cancelFadeTimer();
            this.toggle();
        });
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
        document.querySelectorAll<HTMLButtonElement>('.effect-btn').forEach(b => {
            const isActive = b.dataset.effect === effect;
            b.classList.toggle('ss-c-button--primary', isActive);
            b.classList.toggle('ss-c-button--outline', !isActive);
            b.setAttribute('aria-pressed', String(isActive));
        });
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
        // The inline opacity overrides the .visible class, so it must be
        // cleared on hide or the overlay never fades out.
        if (this.overlay) this.overlay.style.opacity = this.isVisible ? String(this.opacity) : '';
        const toggleBtn = document.getElementById('toggleOverlay');
        if (toggleBtn) toggleBtn.textContent = this.isVisible ? 'Hide Overlay' : 'Show Overlay';
    }

    fadeInOut(): void {
        if (!this.isVisible) {
            this.toggle();
            this.cancelFadeTimer();
            this.fadeTimer = setTimeout(() => {
                this.fadeTimer = null;
                if (this.isVisible) this.toggle();
            }, this.fadeDuration * 3);
        }
    }

    private cancelFadeTimer(): void {
        if (this.fadeTimer) clearTimeout(this.fadeTimer);
        this.fadeTimer = null;
    }

    reset(): void {
        this.cancelFadeTimer();
        this.isVisible = false;
        this.overlay?.classList.remove('visible');
        if (this.overlay) this.overlay.style.opacity = '';
        const toggleBtn = document.getElementById('toggleOverlay');
        if (toggleBtn) toggleBtn.textContent = 'Show Overlay';
        this.setEffect('vignette');

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
        entry.innerHTML = `[${time}] ${message}`;
        appendLogEntry(logOutput, entry);
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
    const boxes = ['box1', 'box2', 'box3'].map(id => new DemoDraggable(id, handleDrag));

    // Global functions for buttons
    (window as unknown as Record<string, () => void>).resetPositions = () => {
        // Restores each box's original inline styles (including box3's size)
        boxes.forEach(box => box.reset());
        log('Positions reset');
    };

    (window as unknown as Record<string, () => void>).clearLog = () => {
        if (logOutput) {
            logOutput.innerHTML = '<div>[--:--:--] Log cleared</div>';
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
    function log(type: string, details: string): void {
        const gestureLog = document.getElementById('gestureLog');
        if (!gestureLog) return;
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.innerHTML = `${time}  <strong>${type}</strong>  ${details}`;
        appendLogEntry(gestureLog, entry);
    }

    const gesture = new DemoGesture('gestureArea', log);

    (window as unknown as Record<string, () => void>).resetStats = () => {
        gesture.resetStats();
        log('RESET', 'Stats cleared');
    };

    (window as unknown as Record<string, () => void>).clearLog = () => {
        const gestureLog = document.getElementById('gestureLog');
        if (gestureLog) {
            gestureLog.innerHTML = '<div>--:--:--  <strong>INIT</strong>  Log cleared</div>';
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
        if (activityLog) activityLog.innerHTML = '<div>[--:--:--] Demo reset</div>';
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
