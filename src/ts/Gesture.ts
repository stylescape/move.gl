// ============================================================================
// move.gl | Gesture Handlers
// ============================================================================
// Copyright 2026 Scape Press BV
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
    /** Rotation in degrees since the two-finger gesture started */
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
    /** Movement in px before a single touch counts as a swipe instead of a tap */
    private static readonly SWIPE_THRESHOLD = 10;

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
        this.element.addEventListener('touchstart', this.handleTouchStart, { passive: true });
        this.element.addEventListener('touchmove', this.handleTouchMove, { passive: true });
        this.element.addEventListener('touchend', this.handleTouchEnd);
        this.element.addEventListener('touchcancel', this.handleTouchCancel);
    }

    private handleTouchStart = (event: TouchEvent): void => {
        // A finger added mid-gesture restarts measurement from the new set.
        this.startTouches = Array.from(event.touches);
        this.lastTouches = this.startTouches;
        if (event.touches.length > 1) {
            this.isPinching = true;
            this.isSwiping = false;
        }
    };

    private handleTouchMove = (event: TouchEvent): void => {
        if (!this.startTouches) return;

        this.lastTouches = Array.from(event.touches);

        if (event.touches.length === 1 && !this.isPinching) {
            const dx = event.touches[0].clientX - this.startTouches[0].clientX;
            const dy = event.touches[0].clientY - this.startTouches[0].clientY;
            const threshold = TouchGestureHandler.SWIPE_THRESHOLD;
            if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
                this.isSwiping = true;
            }
        } else if (event.touches.length > 1 && this.isPinching && this.startTouches.length > 1) {
            const [start0, start1] = this.startTouches;
            const [current0, current1] = [event.touches[0], event.touches[1]];

            const startDistance = this.getDistance(start0, start1);
            if (startDistance > 0) {
                this.callbacks.onPinch?.(this.getDistance(current0, current1) / startDistance);
            }
            // Normalise to [-180, 180) so crossing the atan2 seam doesn't jump by 360.
            const rotation = this.getAngle(current0, current1) - this.getAngle(start0, start1);
            this.callbacks.onRotate?.(((rotation + 540) % 360) - 180);
        }
    };

    private handleTouchEnd = (event: TouchEvent): void => {
        // Wait until every finger is lifted; lifting one finger of a pinch
        // must not end the gesture as a tap or swipe.
        if (event.touches.length > 0 || !this.startTouches) return;

        if (this.isSwiping && this.lastTouches && this.lastTouches.length > 0) {
            const dx = this.lastTouches[0].clientX - this.startTouches[0].clientX;
            const dy = this.lastTouches[0].clientY - this.startTouches[0].clientY;
            this.callbacks.onSwipe?.(this.getSwipeDirection(dx, dy), dx, dy);
        } else if (!this.isPinching) {
            this.callbacks.onTap?.();
        }
        this.reset();
    };

    private handleTouchCancel = (): void => {
        this.reset();
    };

    private reset(): void {
        this.startTouches = null;
        this.lastTouches = null;
        this.isSwiping = false;
        this.isPinching = false;
    }

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
        return Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
    }

    /**
     * Calculates the angle in degrees of the line between two touch points.
     */
    private getAngle(touch1: Touch, touch2: Touch): number {
        return Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * 180 / Math.PI;
    }

    /**
     * Removes all event listeners and cleans up.
     */
    public destroy(): void {
        this.element.removeEventListener('touchstart', this.handleTouchStart);
        this.element.removeEventListener('touchmove', this.handleTouchMove);
        this.element.removeEventListener('touchend', this.handleTouchEnd);
        this.element.removeEventListener('touchcancel', this.handleTouchCancel);
        this.reset();
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
        this.element.addEventListener('pointerdown', this.handleGestureStart);
        this.element.addEventListener('pointermove', this.handleGestureMove);
        this.element.addEventListener('pointerup', this.handleGestureEnd);
        this.element.addEventListener('pointercancel', this.handleGestureEnd);
    }

    private handleGestureStart = (event: PointerEvent): void => {
        this.ongoingTouches.set(event.pointerId, event);
        // Keep receiving move/up events when the pointer leaves the element,
        // otherwise a release outside it leaves the gesture stuck "down".
        this.element.setPointerCapture(event.pointerId);
        this.callbacks.onGestureStart?.(event);
    };

    private handleGestureMove = (event: PointerEvent): void => {
        const startEvent = this.ongoingTouches.get(event.pointerId);
        if (startEvent) {
            const dx = event.clientX - startEvent.clientX;
            const dy = event.clientY - startEvent.clientY;
            this.callbacks.onGestureMove?.(dx, dy, event);
        }
    };

    private handleGestureEnd = (event: PointerEvent): void => {
        if (!this.ongoingTouches.delete(event.pointerId)) return;
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
        this.ongoingTouches.clear();
    }
}

export default {
    TouchGestureHandler,
    AdvancedGestureRecognition
};
