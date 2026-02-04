// ============================================================================
// move.gl | Gesture Handlers
// ============================================================================
// Copyright 2025 Scape Agency BV
// Licensed under MIT License
// ============================================================================

/**
 * Swipe direction type
 */
export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

/**
 * Gesture event callbacks
 */
export interface GestureCallbacks {
    onTap?: () => void;
    onSwipe?: (direction: SwipeDirection, deltaX: number, deltaY: number) => void;
    onPinch?: (scale: number) => void;
    onRotate?: (angle: number) => void;
}

/**
 * Touch Gesture Handler Class
 *
 * Manages touch interactions on a specified element, interpreting various
 * gestures like taps, swipes, and pinches.
 *
 * @example
 * ```typescript
 * const gesture = new TouchGestureHandler('myElement', {
 *     onSwipe: (dir, dx, dy) => console.log(`Swiped ${dir}`),
 *     onPinch: (scale) => console.log(`Pinch scale: ${scale}`)
 * });
 * ```
 */
export class TouchGestureHandler {
    private element: HTMLElement;
    private startTouches: Touch[] | null = null;
    private lastTouches: Touch[] | null = null;
    private isSwiping = false;
    private isPinching = false;
    private callbacks: GestureCallbacks;

    /**
     * Creates a new TouchGestureHandler instance.
     * @param elementId - The ID of the element to attach gesture handling to.
     * @param callbacks - Optional callback functions for gesture events.
     */
    constructor(elementId: string, callbacks: GestureCallbacks = {}) {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Element with id "${elementId}" not found`);
        }
        this.element = element;
        this.callbacks = callbacks;
        this.addTouchListeners();
    }

    private addTouchListeners(): void {
        this.element.addEventListener('touchstart', this.handleTouchStart, false);
        this.element.addEventListener('touchmove', this.handleTouchMove, false);
        this.element.addEventListener('touchend', this.handleTouchEnd, false);
    }

    private handleTouchStart = (event: TouchEvent): void => {
        if (event.touches.length === 1) {
            this.startTouches = Array.from(event.touches);
        } else if (event.touches.length > 1) {
            this.startTouches = Array.from(event.touches);
            this.isPinching = true;
        }
    };

    private handleTouchMove = (event: TouchEvent): void => {
        if (!this.startTouches) return;

        this.lastTouches = Array.from(event.touches);

        if (event.touches.length === 1 && !this.isPinching) {
            const dx = event.touches[0].clientX - this.startTouches[0].clientX;
            const dy = event.touches[0].clientY - this.startTouches[0].clientY;
            if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                this.isSwiping = true;
            }
        } else if (event.touches.length > 1 && this.isPinching && this.startTouches.length > 1) {
            const startDistance = this.getDistance(this.startTouches[0], this.startTouches[1]);
            const currentDistance = this.getDistance(event.touches[0], event.touches[1]);
            const scale = currentDistance / startDistance;
            this.callbacks.onPinch?.(scale);
        }
    };

    private handleTouchEnd = (): void => {
        if (this.isSwiping && this.startTouches && this.lastTouches) {
            const dx = this.lastTouches[0].clientX - this.startTouches[0].clientX;
            const dy = this.lastTouches[0].clientY - this.startTouches[0].clientY;
            const direction = this.getSwipeDirection(dx, dy);
            this.callbacks.onSwipe?.(direction, dx, dy);
            this.isSwiping = false;
        } else if (this.isPinching) {
            this.isPinching = false;
        } else {
            this.callbacks.onTap?.();
        }
        this.startTouches = null;
        this.lastTouches = null;
    };

    /**
     * Determines swipe direction based on deltas.
     */
    private getSwipeDirection(dx: number, dy: number): SwipeDirection {
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 'right' : 'left';
        }
        return dy > 0 ? 'down' : 'up';
    }

    /**
     * Calculates the distance between two touch points.
     */
    private getDistance(touch1: Touch, touch2: Touch): number {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Removes all event listeners and cleans up.
     */
    public destroy(): void {
        this.element.removeEventListener('touchstart', this.handleTouchStart);
        this.element.removeEventListener('touchmove', this.handleTouchMove);
        this.element.removeEventListener('touchend', this.handleTouchEnd);
    }
}


/**
 * Pointer event callbacks
 */
export interface PointerGestureCallbacks {
    onGestureStart?: (event: PointerEvent) => void;
    onGestureMove?: (deltaX: number, deltaY: number, event: PointerEvent) => void;
    onGestureEnd?: (event: PointerEvent) => void;
}

/**
 * Advanced Gesture Recognition Handler
 *
 * Handles complex gestures for interactive applications using pointer events.
 * Works with mouse, touch, and pen input.
 *
 * @example
 * ```typescript
 * const gesture = new AdvancedGestureRecognition('myElement', {
 *     onGestureMove: (dx, dy) => console.log(`Moved ${dx}px, ${dy}px`)
 * });
 * ```
 */
export class AdvancedGestureRecognition {
    private element: HTMLElement;
    private ongoingTouches: Map<number, PointerEvent> = new Map();
    private callbacks: PointerGestureCallbacks;

    /**
     * Creates a new AdvancedGestureRecognition instance.
     * @param elementId - The ID of the element to attach gesture handling to.
     * @param callbacks - Optional callback functions for gesture events.
     */
    constructor(elementId: string, callbacks: PointerGestureCallbacks = {}) {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Element with id "${elementId}" not found`);
        }
        this.element = element;
        this.callbacks = callbacks;
        this.attachEventListeners();
    }

    private attachEventListeners(): void {
        this.element.addEventListener('pointerdown', this.handleGestureStart, { passive: false });
        this.element.addEventListener('pointermove', this.handleGestureMove, { passive: false });
        this.element.addEventListener('pointerup', this.handleGestureEnd, { passive: false });
        this.element.addEventListener('pointercancel', this.handleGestureEnd, { passive: false });
    }

    private handleGestureStart = (event: PointerEvent): void => {
        this.ongoingTouches.set(event.pointerId, event);
        this.callbacks.onGestureStart?.(event);
    };

    private handleGestureMove = (event: PointerEvent): void => {
        if (this.ongoingTouches.has(event.pointerId)) {
            const startEvent = this.ongoingTouches.get(event.pointerId)!;
            const dx = event.clientX - startEvent.clientX;
            const dy = event.clientY - startEvent.clientY;
            this.callbacks.onGestureMove?.(dx, dy, event);
        }
    };

    private handleGestureEnd = (event: PointerEvent): void => {
        this.ongoingTouches.delete(event.pointerId);
        this.callbacks.onGestureEnd?.(event);
    };

    /**
     * Removes all event listeners and cleans up.
     */
    public destroy(): void {
        this.element.removeEventListener('pointerdown', this.handleGestureStart);
        this.element.removeEventListener('pointermove', this.handleGestureMove);
        this.element.removeEventListener('pointerup', this.handleGestureEnd);
        this.element.removeEventListener('pointercancel', this.handleGestureEnd);
    }
}

export default {
    TouchGestureHandler,
    AdvancedGestureRecognition
};




