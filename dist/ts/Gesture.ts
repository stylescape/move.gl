// Copyright 2024 Scape Agency BV


// Touch Gesture Handler Class
// A class for handling touch gestures can interpret user input like swipes, taps, and pinch actions, which are common in mobile and modern web applications.


/**
 * @title Touch Gesture Handler Class
 * @notice Manages touch interactions on a specified element, interpreting various gestures like taps, swipes, and pinches.
 * @dev This class attaches touch event listeners to an element and interprets common gestures by analyzing touch points.
 */
 class TouchGestureHandler {
    private element: HTMLElement;
    private startTouches: TouchList | null = null;
    private isSwiping = false;
    private isPinching = false;

    constructor(elementId: string) {
        this.element = document.getElementById(elementId) as HTMLElement;
        this.addTouchListeners();
    }

    private addTouchListeners() {
        this.element.addEventListener('touchstart', this.handleTouchStart, false);
        this.element.addEventListener('touchmove', this.handleTouchMove, false);
        this.element.addEventListener('touchend', this.handleTouchEnd, false);
    }

    private handleTouchStart = (event: TouchEvent) => {
        if (event.touches.length === 1) {
            this.startTouches = event.touches;
            console.log("Tap started or potential swipe:", event.touches);
        } else if (event.touches.length > 1) {
            this.startTouches = event.touches;
            console.log("Pinch started or potential rotation:", event.touches);
            this.isPinching = true;
        }
    };

    private handleTouchMove = (event: TouchEvent) => {
        if (event.touches.length === 1 && this.startTouches && !this.isPinching) {
            const dx = event.touches[0].clientX - this.startTouches[0].clientX;
            const dy = event.touches[0].clientY - this.startTouches[0].clientY;
            if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                this.isSwiping = true;
                console.log(`Swipe detected: deltaX = ${dx}, deltaY = ${dy}`);
            }
        } else if (event.touches.length > 1 && this.isPinching) {
            const startDistance = this.getDistance(this.startTouches[0], this.startTouches[1]);
            const currentDistance = this.getDistance(event.touches[0], event.touches[1]);
            const scale = currentDistance / startDistance;
            console.log(`Pinch scaling factor: ${scale}`);
        }
    };

    private handleTouchEnd = (event: TouchEvent) => {
        if (this.isSwiping) {
            console.log("Swipe ended");
            this.isSwiping = false;
        } else if (this.isPinching) {
            console.log("Pinch ended");
            this.isPinching = false;
        } else {
            console.log("Tap confirmed");
        }
        this.startTouches = null;
    };

    /**
     * Calculates the distance between two touch points.
     * @param touch1 First touch point.
     * @param touch2 Second touch point.
     * @returns Distance in pixels.
     */
    private getDistance(touch1: Touch, touch2: Touch): number {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

new TouchGestureHandler('touchElement');







/**
 * @title Advanced Gesture Recognition Handler
 * @notice Handles complex gestures for interactive applications, enhancing user experience with intuitive controls.
 * @dev Utilizes pointer events to detect and interpret various gestures.
 */
 class AdvancedGestureRecognition {
    private element: HTMLElement;
    private ongoingTouches: Map<number, Touch> = new Map();

    constructor(elementId: string) {
        this.element = document.getElementById(elementId) as HTMLElement;
        this.attachEventListeners();
    }

    private attachEventListeners() {
        this.element.addEventListener('pointerdown', this.handleGestureStart, { passive: false });
        this.element.addEventListener('pointermove', this.handleGestureMove, { passive: false });
        this.element.addEventListener('pointerup', this.handleGestureEnd, { passive: false });
    }

    private handleGestureStart = (event: PointerEvent) => {
        this.ongoingTouches.set(event.pointerId, event);
        console.log("Gesture started:", event.pointerType);
    };

    private handleGestureMove = (event: PointerEvent) => {
        if (this.ongoingTouches.has(event.pointerId)) {
            const startEvent = this.ongoingTouches.get(event.pointerId)!;
            const dx = event.clientX - startEvent.clientX;
            const dy = event.clientY - startEvent.clientY;
            console.log(`Gesture moved: ${dx}px horizontal, ${dy}px vertical`);
        }
    };

    private handleGestureEnd = (event: PointerEvent) => {
        this.ongoingTouches.delete(event.pointerId);
        console.log("Gesture ended");
    };
}




/**
 * @title Advanced Interaction Controls
 * @notice Enhances user interactions within immersive environments with sophisticated input methods.
 * @dev Integrates gesture recognition, voice commands, and potentially eye tracking for advanced control.
 */
 class AdvancedInteractionControls {
    constructor() {
        this.initializeGestureControls();
        this.initializeVoiceCommands();
    }

    private initializeGestureControls() {
        console.log("Gesture controls initialized.");
        // Setup gesture recognition logic or integrate with a library like Hammer.js
    }

    private initializeVoiceCommands() {
        console.log("Voice command system initialized.");
        // Setup voice recognition using APIs like the Web Speech API
    }

    public onGestureRecognized(gesture: string) {
        console.log(`Gesture recognized: ${gesture}`);
        // Respond to specific gestures
    }

    public onVoiceCommand(command: string) {
        console.log(`Voice command received: ${command}`);
        // Execute actions based on voice commands
    }
}




