// ============================================================================
// move.gl | Main Entry Point
// ============================================================================
// Copyright 2025 Scape Agency BV
// Licensed under MIT License
// ============================================================================

/**
 * move.gl - Motion & Animation Library
 *
 * A comprehensive TypeScript/SCSS library for creating interactive
 * motion effects, gestures, and animations for web applications.
 */

// Core Components
export { Draggable } from './Draggable.js';
export type { DraggableOptions } from './Draggable.js';

export { Screensaver } from './Screensaver.js';
export type { ScreensaverOptions } from './Screensaver.js';

export { VirtualKeyboard } from './Keyboard.js';
export type { KeyboardLayout, VirtualKeyboardOptions } from './Keyboard.js';

export {
    AdvancedGestureRecognition, TouchGestureHandler
} from './Gesture.js';
export type {
    GestureCallbacks,
    PointerGestureCallbacks, SwipeDirection
} from './Gesture.js';

export {
    getOptimalVideoSource, supportsHEVCAlpha, TransparentVideoOverlay
} from './VideoOverlay.js';
export type { VideoOverlayOptions } from './VideoOverlay.js';

// Re-export default classes
import { Draggable } from './Draggable.js';
import { AdvancedGestureRecognition, TouchGestureHandler } from './Gesture.js';
import { VirtualKeyboard } from './Keyboard.js';
import { Screensaver } from './Screensaver.js';
import { TransparentVideoOverlay } from './VideoOverlay.js';

export default {
    Draggable,
    Screensaver,
    VirtualKeyboard,
    TouchGestureHandler,
    AdvancedGestureRecognition,
    TransparentVideoOverlay,
};
