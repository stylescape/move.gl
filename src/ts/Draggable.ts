// ============================================================================
// move.gl | Draggable
// ============================================================================
// Copyright 2026 Scape Press BV
// Licensed under MIT License
// ============================================================================

/**
 * Options for the Draggable class
 */
export interface DraggableOptions {
    /** Whether to constrain dragging to parent bounds (default: true) */
    constrainToParent?: boolean;
    /** CSS cursor style during drag (default: 'grabbing') */
    dragCursor?: string;
    /** Callback when drag starts */
    onDragStart?: (x: number, y: number) => void;
    /** Callback during drag */
    onDrag?: (x: number, y: number) => void;
    /** Callback when drag ends */
    onDragEnd?: (x: number, y: number) => void;
}

/**
 * Draggable Element Handler
 *
 * Makes a positioned element draggable by updating its `left`/`top`,
 * optionally confined to its parent container. Uses pointer events, so
 * mouse, touch and pen input all work.
 *
 * @example
 * ```typescript
 * const draggable = new Draggable('myElement', {
 *     onDragEnd: (x, y) => console.log(`Dropped at ${x}, ${y}`)
 * });
 * ```
 */
export class Draggable {
    private element: HTMLElement;
    private options: Required<Pick<DraggableOptions, 'constrainToParent' | 'dragCursor'>> & DraggableOptions;
    private pointerId: number | null = null;
    private startClientX = 0;
    private startClientY = 0;
    private startLeft = 0;
    private startTop = 0;
    private bounds = { minX: -Infinity, maxX: Infinity, minY: -Infinity, maxY: Infinity };
    private previousCursor = '';
    private previousTouchAction: string;

    /**
     * Creates a new Draggable instance.
     * @param elementId - The ID of the HTML element to make draggable.
     * @param options - Optional drag behaviour and callbacks.
     * @throws Error if element or parent element is not found.
     */
    constructor(elementId: string, options: DraggableOptions = {}) {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Element with id "${elementId}" not found`);
        }
        if (!element.parentElement) {
            throw new Error('Draggable element must have a parent element');
        }
        this.element = element;
        this.options = { constrainToParent: true, dragCursor: 'grabbing', ...options };

        // Without this, touch input scrolls the page instead of dragging.
        this.previousTouchAction = this.element.style.touchAction;
        this.element.style.touchAction = 'none';

        this.element.addEventListener('pointerdown', this.startDrag);
        this.element.addEventListener('pointermove', this.drag);
        this.element.addEventListener('pointerup', this.stopDrag);
        this.element.addEventListener('pointercancel', this.stopDrag);
    }

    /**
     * Whether a drag is currently in progress.
     */
    public get isDragging(): boolean {
        return this.pointerId !== null;
    }

    /**
     * Initiates the drag operation.
     */
    private startDrag = (event: PointerEvent): void => {
        if (this.isDragging || (event.pointerType === 'mouse' && event.button !== 0)) return;

        this.pointerId = event.pointerId;
        this.element.setPointerCapture(event.pointerId);

        this.startClientX = event.clientX;
        this.startClientY = event.clientY;
        this.startLeft = this.element.offsetLeft;
        this.startTop = this.element.offsetTop;

        // Measure at drag start rather than once in the constructor, so the
        // bounds stay correct after scrolling, resizing or reflow.
        const parent = this.element.parentElement;
        if (this.options.constrainToParent && parent) {
            const parentRect = parent.getBoundingClientRect();
            const rect = this.element.getBoundingClientRect();
            const innerLeft = parentRect.left + parent.clientLeft;
            const innerTop = parentRect.top + parent.clientTop;
            this.bounds = {
                minX: innerLeft - rect.left,
                maxX: innerLeft + parent.clientWidth - rect.right,
                minY: innerTop - rect.top,
                maxY: innerTop + parent.clientHeight - rect.bottom,
            };
        } else {
            this.bounds = { minX: -Infinity, maxX: Infinity, minY: -Infinity, maxY: Infinity };
        }

        this.previousCursor = this.element.style.cursor;
        this.element.style.cursor = this.options.dragCursor;
        event.preventDefault();
        this.options.onDragStart?.(this.startLeft, this.startTop);
    };

    /**
     * Handles the drag movement.
     */
    private drag = (event: PointerEvent): void => {
        if (event.pointerId !== this.pointerId) return;

        const { minX, maxX, minY, maxY } = this.bounds;
        const dx = clamp(event.clientX - this.startClientX, minX, maxX);
        const dy = clamp(event.clientY - this.startClientY, minY, maxY);
        const x = this.startLeft + dx;
        const y = this.startTop + dy;

        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        this.options.onDrag?.(x, y);
    };

    /**
     * Stops the drag operation.
     */
    private stopDrag = (event: PointerEvent): void => {
        if (event.pointerId !== this.pointerId) return;

        this.pointerId = null;
        if (this.element.hasPointerCapture(event.pointerId)) {
            this.element.releasePointerCapture(event.pointerId);
        }
        this.element.style.cursor = this.previousCursor;
        this.options.onDragEnd?.(this.element.offsetLeft, this.element.offsetTop);
    };

    /**
     * Removes all event listeners and cleans up.
     */
    public destroy(): void {
        this.element.removeEventListener('pointerdown', this.startDrag);
        this.element.removeEventListener('pointermove', this.drag);
        this.element.removeEventListener('pointerup', this.stopDrag);
        this.element.removeEventListener('pointercancel', this.stopDrag);
        if (this.isDragging) {
            this.element.style.cursor = this.previousCursor;
            this.pointerId = null;
        }
        this.element.style.touchAction = this.previousTouchAction;
    }
}

function clamp(value: number, min: number, max: number): number {
    // An element larger than its parent has min > max; pin it to the start edge.
    return Math.max(min, Math.min(value, Math.max(min, max)));
}

export default Draggable;
