interface DraggableOptions {
    constrainToParent?: boolean;
    dragCursor?: string;
    onDragStart?: (x: number, y: number) => void;
    onDrag?: (x: number, y: number) => void;
    onDragEnd?: (x: number, y: number) => void;
}
declare class Draggable {
    private element;
    private isDragging;
    private startX;
    private startY;
    private boundRect;
    constructor(elementId: string);
    private attachEventListeners;
    private getClientCoordinates;
    private startDrag;
    private drag;
    private stopDrag;
    destroy(): void;
}

interface ScreensaverOptions {
    timeout: number;
    videoUrl?: string;
    audioUrl?: string;
    containerId?: string;
    videoId?: string;
    audioId?: string;
}
declare class Screensaver {
    private timeoutId;
    private readonly timeout;
    private screensaverElement;
    private videoElement;
    private audioElement;
    private isActive;
    private readonly options;
    constructor(options: ScreensaverOptions);
    private initializeElements;
    private loadMedia;
    private setupEventListeners;
    private startScreensaverTimeout;
    private resetScreensaver;
    private activateScreensaver;
    stopScreensaver(): void;
    setVolume(volume: number): void;
    getIsActive(): boolean;
    destroy(): void;
}

interface KeyboardLayout {
    [mode: string]: string[][];
}
interface VirtualKeyboardOptions {
    layout?: KeyboardLayout;
    onKeyPress?: (key: string) => void;
}
declare class VirtualKeyboard {
    private keys;
    private currentMode;
    private inputElement;
    private keyboardElement;
    constructor(inputId: string, keyboardId: string);
    private renderKeyboard;
    private handleKeyPress;
    private toggleShift;
    private attachEventListeners;
    private handlePhysicalKeyPress;
    private handleTouchStart;
    switchMode(mode: string): void;
    destroy(): void;
}

type SwipeDirection = 'left' | 'right' | 'up' | 'down';
interface GestureCallbacks {
    onTap?: () => void;
    onSwipe?: (direction: SwipeDirection, deltaX: number, deltaY: number) => void;
    onPinch?: (scale: number) => void;
    onRotate?: (angle: number) => void;
}
declare class TouchGestureHandler {
    private element;
    private startTouches;
    private lastTouches;
    private isSwiping;
    private isPinching;
    private callbacks;
    constructor(elementId: string, callbacks?: GestureCallbacks);
    private addTouchListeners;
    private handleTouchStart;
    private handleTouchMove;
    private handleTouchEnd;
    private getSwipeDirection;
    private getDistance;
    destroy(): void;
}
interface PointerGestureCallbacks {
    onGestureStart?: (event: PointerEvent) => void;
    onGestureMove?: (deltaX: number, deltaY: number, event: PointerEvent) => void;
    onGestureEnd?: (event: PointerEvent) => void;
}
declare class AdvancedGestureRecognition {
    private element;
    private ongoingTouches;
    private callbacks;
    constructor(elementId: string, callbacks?: PointerGestureCallbacks);
    private attachEventListeners;
    private handleGestureStart;
    private handleGestureMove;
    private handleGestureEnd;
    destroy(): void;
}

interface VideoOverlayOptions {
    fadeTransitionDuration?: number;
    loop?: boolean;
    initialSource?: string;
}
declare class TransparentVideoOverlay {
    private videoElement;
    private isVisible;
    private fadeTransitionDuration;
    private loop;
    constructor(videoElementId: string, options?: VideoOverlayOptions);
    private setupVideo;
    showOverlay(): void;
    hideOverlay(): void;
    toggleOverlay(): void;
    changeVideoSource(videoUrl: string, autoPlay?: boolean): void;
    getIsVisible(): boolean;
    destroy(): void;
}
declare function supportsHEVCAlpha(): boolean;
declare function getOptimalVideoSource(hevcSource: string, webmSource: string): string;

interface LoaderConfig {
    id: string;
    content?: string;
    css: string;
    html?: string;
}
interface LoaderOptions {
    container?: HTMLElement | string;
    useShadowDOM?: boolean;
    className?: string;
    size?: number | string;
    color?: string;
    accentColor?: string;
}
type LoaderCategory = 'spinner' | 'dots' | 'bars' | 'progress' | 'pulse' | 'bounce' | 'text' | 'skeleton' | 'custom';
declare class LoaderManager {
    private loaders;
    private activeLoaders;
    private defaultVars;
    constructor(preloadBuiltins?: boolean);
    register(config: LoaderConfig): this;
    registerAll(configs: LoaderConfig[]): this;
    create(loaderId: string, options?: LoaderOptions): HTMLElement;
    createOverlay(loaderId: string, options?: Omit<LoaderOptions, 'container'>): HTMLElement;
    showIn(loaderId: string, target: HTMLElement | string, options?: LoaderOptions): HTMLElement;
    hideIn(target: HTMLElement | string): void;
    destroy(loader: HTMLElement): void;
    destroyAll(): void;
    getRegisteredLoaders(): string[];
    has(loaderId: string): boolean;
    getConfig(loaderId: string): LoaderConfig | undefined;
    private processCSS;
    private scopeCSS;
    private registerBuiltinLoaders;
}
declare const loaderManager: LoaderManager;

declare const _default: {
    Draggable: typeof Draggable;
    LoaderManager: typeof LoaderManager;
    Screensaver: typeof Screensaver;
    VirtualKeyboard: typeof VirtualKeyboard;
    TouchGestureHandler: typeof TouchGestureHandler;
    AdvancedGestureRecognition: typeof AdvancedGestureRecognition;
    TransparentVideoOverlay: typeof TransparentVideoOverlay;
};

export { AdvancedGestureRecognition, Draggable, type DraggableOptions, type GestureCallbacks, type KeyboardLayout, type LoaderCategory, type LoaderConfig, LoaderManager, type LoaderOptions, type PointerGestureCallbacks, Screensaver, type ScreensaverOptions, type SwipeDirection, TouchGestureHandler, TransparentVideoOverlay, type VideoOverlayOptions, VirtualKeyboard, type VirtualKeyboardOptions, _default as default, getOptimalVideoSource, loaderManager, supportsHEVCAlpha };
