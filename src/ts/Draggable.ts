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
    /** Whether to constrain dragging to parent bounds */
    constrainToParent?: boolean;
    /** CSS cursor style during drag */
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
 * Provides functionality to make an element draggable within the confines
 * of its parent container. Supports both mouse and touch interactions,
 * ensuring usability across different devices.
 *
 * @example
 * ```typescript
 * const draggable = new Draggable('myElement');
 * // Element with id="myElement" is now draggable
 * ```
 */
export class Draggable {
    private element: HTMLElement;
    private isDragging: boolean = false;
    private startX: number = 0;
    private startY: number = 0;
    private boundRect: DOMRect;

    /**
     * Creates a new Draggable instance.
     * @param elementId - The ID of the HTML element to make draggable.
     * @throws Error if element or parent element is not found.
     */
    constructor(elementId: string) {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Element with id "${elementId}" not found`);
        }
        this.element = element;

        const parent = this.element.parentElement;
        if (!parent) {
            throw new Error('Draggable element must have a parent element');
        }
        this.boundRect = parent.getBoundingClientRect();
        this.attachEventListeners();
    }

    /**
     * Attaches all necessary event listeners for drag functionality.
     */
    private attachEventListeners(): void {
        this.element.addEventListener('mousedown', this.startDrag);
        this.element.addEventListener('touchstart', this.startDrag, { passive: false });

        document.addEventListener('mouseup', this.stopDrag);
        document.addEventListener('touchend', this.stopDrag);

        document.addEventListener('mousemove', this.drag);
        document.addEventListener('touchmove', this.drag, { passive: false });
    }

    /**
     * Gets the client coordinates from a mouse or touch event.
     */
    private getClientCoordinates(event: MouseEvent | TouchEvent): { clientX: number; clientY: number } {
        if ('touches' in event && event.touches.length > 0) {
            return {
                clientX: event.touches[0].clientX,
                clientY: event.touches[0].clientY
            };
        }
        return {
            clientX: (event as MouseEvent).clientX,
            clientY: (event as MouseEvent).clientY
        };
    }

    /**
     * Initiates the drag operation.
     */
    private startDrag = (event: MouseEvent | TouchEvent): void => {
        const coords = this.getClientCoordinates(event);
        this.isDragging = true;
        this.startX = coords.clientX - this.element.offsetLeft;
        this.startY = coords.clientY - this.element.offsetTop;
        event.preventDefault();
    };

    /**
     * Handles the drag movement.
     */
    private drag = (event: MouseEvent | TouchEvent): void => {
        if (!this.isDragging) return;

        const coords = this.getClientCoordinates(event);
        let x = coords.clientX - this.startX;
        let y = coords.clientY - this.startY;

        // Constrain the movement within the bounds of the element's parent
        x = Math.max(this.boundRect.left, Math.min(x, this.boundRect.right - this.element.offsetWidth));
        y = Math.max(this.boundRect.top, Math.min(y, this.boundRect.bottom - this.element.offsetHeight));

        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
    };

    /**
     * Stops the drag operation.
     */
    private stopDrag = (): void => {
        this.isDragging = false;
    };

    /**
     * Removes all event listeners and cleans up.
     */
    public destroy(): void {
        this.element.removeEventListener('mousedown', this.startDrag);
        this.element.removeEventListener('touchstart', this.startDrag);
        document.removeEventListener('mouseup', this.stopDrag);
        document.removeEventListener('touchend', this.stopDrag);
        document.removeEventListener('mousemove', this.drag);
        document.removeEventListener('touchmove', this.drag);
    }
}

export default Draggable;
