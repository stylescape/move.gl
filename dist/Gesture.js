export class TouchGestureHandler {
    constructor(elementId, callbacks = {}) {
        this.startTouches = null;
        this.lastTouches = null;
        this.isSwiping = false;
        this.isPinching = false;
        this.handleTouchStart = (event) => {
            if (event.touches.length === 1) {
                this.startTouches = Array.from(event.touches);
            }
            else if (event.touches.length > 1) {
                this.startTouches = Array.from(event.touches);
                this.isPinching = true;
            }
        };
        this.handleTouchMove = (event) => {
            var _a, _b;
            if (!this.startTouches)
                return;
            this.lastTouches = Array.from(event.touches);
            if (event.touches.length === 1 && !this.isPinching) {
                const dx = event.touches[0].clientX - this.startTouches[0].clientX;
                const dy = event.touches[0].clientY - this.startTouches[0].clientY;
                if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                    this.isSwiping = true;
                }
            }
            else if (event.touches.length > 1 && this.isPinching && this.startTouches.length > 1) {
                const startDistance = this.getDistance(this.startTouches[0], this.startTouches[1]);
                const currentDistance = this.getDistance(event.touches[0], event.touches[1]);
                const scale = currentDistance / startDistance;
                (_b = (_a = this.callbacks).onPinch) === null || _b === void 0 ? void 0 : _b.call(_a, scale);
            }
        };
        this.handleTouchEnd = () => {
            var _a, _b, _c, _d;
            if (this.isSwiping && this.startTouches && this.lastTouches) {
                const dx = this.lastTouches[0].clientX - this.startTouches[0].clientX;
                const dy = this.lastTouches[0].clientY - this.startTouches[0].clientY;
                const direction = this.getSwipeDirection(dx, dy);
                (_b = (_a = this.callbacks).onSwipe) === null || _b === void 0 ? void 0 : _b.call(_a, direction, dx, dy);
                this.isSwiping = false;
            }
            else if (this.isPinching) {
                this.isPinching = false;
            }
            else {
                (_d = (_c = this.callbacks).onTap) === null || _d === void 0 ? void 0 : _d.call(_c);
            }
            this.startTouches = null;
            this.lastTouches = null;
        };
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Element with id "${elementId}" not found`);
        }
        this.element = element;
        this.callbacks = callbacks;
        this.addTouchListeners();
    }
    addTouchListeners() {
        this.element.addEventListener('touchstart', this.handleTouchStart, false);
        this.element.addEventListener('touchmove', this.handleTouchMove, false);
        this.element.addEventListener('touchend', this.handleTouchEnd, false);
    }
    getSwipeDirection(dx, dy) {
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 'right' : 'left';
        }
        return dy > 0 ? 'down' : 'up';
    }
    getDistance(touch1, touch2) {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    destroy() {
        this.element.removeEventListener('touchstart', this.handleTouchStart);
        this.element.removeEventListener('touchmove', this.handleTouchMove);
        this.element.removeEventListener('touchend', this.handleTouchEnd);
    }
}
export class AdvancedGestureRecognition {
    constructor(elementId, callbacks = {}) {
        this.ongoingTouches = new Map();
        this.handleGestureStart = (event) => {
            var _a, _b;
            this.ongoingTouches.set(event.pointerId, event);
            (_b = (_a = this.callbacks).onGestureStart) === null || _b === void 0 ? void 0 : _b.call(_a, event);
        };
        this.handleGestureMove = (event) => {
            var _a, _b;
            if (this.ongoingTouches.has(event.pointerId)) {
                const startEvent = this.ongoingTouches.get(event.pointerId);
                const dx = event.clientX - startEvent.clientX;
                const dy = event.clientY - startEvent.clientY;
                (_b = (_a = this.callbacks).onGestureMove) === null || _b === void 0 ? void 0 : _b.call(_a, dx, dy, event);
            }
        };
        this.handleGestureEnd = (event) => {
            var _a, _b;
            this.ongoingTouches.delete(event.pointerId);
            (_b = (_a = this.callbacks).onGestureEnd) === null || _b === void 0 ? void 0 : _b.call(_a, event);
        };
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Element with id "${elementId}" not found`);
        }
        this.element = element;
        this.callbacks = callbacks;
        this.attachEventListeners();
    }
    attachEventListeners() {
        this.element.addEventListener('pointerdown', this.handleGestureStart, { passive: false });
        this.element.addEventListener('pointermove', this.handleGestureMove, { passive: false });
        this.element.addEventListener('pointerup', this.handleGestureEnd, { passive: false });
        this.element.addEventListener('pointercancel', this.handleGestureEnd, { passive: false });
    }
    destroy() {
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
//# sourceMappingURL=Gesture.js.map