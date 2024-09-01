// Copyright 2024 Scape Agency BV


// Draggable Element Class
// Creating draggable elements on the screen can enhance interactivity, especially for applications that involve organizing or direct manipulation of elements, such as dashboards or graphic editors.


/**
 * @title Draggable Element Handler
 * @notice Provides functionality to make an element draggable within the confines of its parent container.
 * @dev Supports both mouse and touch interactions, ensuring usability across different devices.
 */
 class Draggable {
    private element: HTMLElement;
    private isDragging: boolean = false;
    private startX: number;
    private startY: number;
    private boundRect: DOMRect;

    constructor(elementId: string) {
        this.element = document.getElementById(elementId) as HTMLElement;
        this.boundRect = this.element.parentElement!.getBoundingClientRect();
        this.attachEventListeners();
    }

    private attachEventListeners() {
        this.element.addEventListener('mousedown', this.startDrag);
        this.element.addEventListener('touchstart', this.startDrag, { passive: false });

        document.addEventListener('mouseup', this.stopDrag);
        document.addEventListener('touchend', this.stopDrag);

        document.addEventListener('mousemove', this.drag);
        document.addEventListener('touchmove', this.drag, { passive: false });
    }

    private startDrag = (event: MouseEvent | TouchEvent) => {
        if (event instanceof TouchEvent) {
            event = event.touches[0];
        }
        this.isDragging = true;
        this.startX = event.clientX - this.element.offsetLeft;
        this.startY = event.clientY - this.element.offsetTop;
        event.preventDefault();
    };

    private drag = (event: MouseEvent | TouchEvent) => {
        if (!this.isDragging) return;
        if (event instanceof TouchEvent) {
            event = event.touches[0];
        }

        let x = event.clientX - this.startX;
        let y = event.clientY - this.startY;

        // Constrain the movement within the bounds of the element's parent
        x = Math.max(this.boundRect.left, Math.min(x, this.boundRect.right - this.element.offsetWidth));
        y = Math.max(this.boundRect.top, Math.min(y, this.boundRect.bottom - this.element.offsetHeight));

        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
    };

    private stopDrag = () => {
        if (this.isDragging) {
            this.isDragging = false;
        }
    };
}

new Draggable('draggableElement');
