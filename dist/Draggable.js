export class Draggable {
    constructor(elementId) {
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.startDrag = (event) => {
            const coords = this.getClientCoordinates(event);
            this.isDragging = true;
            this.startX = coords.clientX - this.element.offsetLeft;
            this.startY = coords.clientY - this.element.offsetTop;
            event.preventDefault();
        };
        this.drag = (event) => {
            if (!this.isDragging)
                return;
            const coords = this.getClientCoordinates(event);
            let x = coords.clientX - this.startX;
            let y = coords.clientY - this.startY;
            x = Math.max(this.boundRect.left, Math.min(x, this.boundRect.right - this.element.offsetWidth));
            y = Math.max(this.boundRect.top, Math.min(y, this.boundRect.bottom - this.element.offsetHeight));
            this.element.style.left = `${x}px`;
            this.element.style.top = `${y}px`;
        };
        this.stopDrag = () => {
            this.isDragging = false;
        };
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
    attachEventListeners() {
        this.element.addEventListener('mousedown', this.startDrag);
        this.element.addEventListener('touchstart', this.startDrag, { passive: false });
        document.addEventListener('mouseup', this.stopDrag);
        document.addEventListener('touchend', this.stopDrag);
        document.addEventListener('mousemove', this.drag);
        document.addEventListener('touchmove', this.drag, { passive: false });
    }
    getClientCoordinates(event) {
        if ('touches' in event && event.touches.length > 0) {
            return {
                clientX: event.touches[0].clientX,
                clientY: event.touches[0].clientY
            };
        }
        return {
            clientX: event.clientX,
            clientY: event.clientY
        };
    }
    destroy() {
        this.element.removeEventListener('mousedown', this.startDrag);
        this.element.removeEventListener('touchstart', this.startDrag);
        document.removeEventListener('mouseup', this.stopDrag);
        document.removeEventListener('touchend', this.stopDrag);
        document.removeEventListener('mousemove', this.drag);
        document.removeEventListener('touchmove', this.drag);
    }
}
export default Draggable;
//# sourceMappingURL=Draggable.js.map