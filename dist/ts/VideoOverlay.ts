// ============================================================================
// move.gl | Video Overlay
// ============================================================================
// Copyright 2026 Scape Press BV
// Licensed under MIT License
// ============================================================================

/**
 * Video overlay options
 */
export interface VideoOverlayOptions {
    /** Fade transition duration in milliseconds */
    fadeTransitionDuration?: number;
    /** Whether to loop the video */
    loop?: boolean;
    /** Initial video source URL */
    initialSource?: string;
}

/**
 * Transparent Video Overlay Handler
 *
 * Manages a transparent video overlay, controlling its visibility,
 * playback, and effects.
 *
 * @example
 * ```typescript
 * const overlay = new TransparentVideoOverlay('myVideo', {
 *     fadeTransitionDuration: 500,
 *     loop: true
 * });
 * overlay.showOverlay();
 * ```
 */
export class TransparentVideoOverlay {
    private videoElement: HTMLVideoElement | null = null;
    private isVisible: boolean = false;
    private fadeTransitionDuration: number;
    private loop: boolean;

    /**
     * Creates a new TransparentVideoOverlay instance.
     * @param videoElementId - The ID of the video element to manage.
     * @param options - Optional configuration options.
     */
    constructor(videoElementId: string, options: VideoOverlayOptions = {}) {
        const element = document.getElementById(videoElementId);
        if (element instanceof HTMLVideoElement) {
            this.videoElement = element;
        } else {
            console.warn(`Element with id "${videoElementId}" is not a video element`);
        }

        this.fadeTransitionDuration = options.fadeTransitionDuration ?? 500;
        this.loop = options.loop ?? true;

        if (this.videoElement) {
            this.setupVideo();
            if (options.initialSource) {
                this.changeVideoSource(options.initialSource, false);
            }
        }
    }

    /**
     * Initializes video settings and event listeners.
     */
    private setupVideo(): void {
        if (!this.videoElement) return;

        if (this.loop) {
            this.videoElement.addEventListener('ended', () => {
                this.videoElement?.play();
            });
        }

        this.videoElement.addEventListener('loadeddata', () => {
            console.log('Video loaded successfully.');
        });

        this.videoElement.addEventListener('error', (e) => {
            console.error('Error loading video:', e);
        });

        // Set initial style for smooth transitions
        this.videoElement.style.transition = `opacity ${this.fadeTransitionDuration}ms ease`;
    }

    /**
     * Shows the video overlay with a fade-in effect.
     */
    public showOverlay(): void {
        if (!this.videoElement) return;

        this.videoElement.style.display = 'block';
        this.videoElement.style.opacity = '0';

        // Use requestAnimationFrame for smoother transition
        requestAnimationFrame(() => {
            if (this.videoElement) {
                this.videoElement.style.opacity = '1';
                this.videoElement.play().catch(err => {
                    console.warn('Auto-play prevented:', err);
                });
            }
        });

        this.isVisible = true;
    }

    /**
     * Hides the video overlay with a fade-out effect.
     */
    public hideOverlay(): void {
        if (!this.videoElement) return;

        this.videoElement.style.opacity = '0';

        setTimeout(() => {
            if (this.videoElement) {
                this.videoElement.style.display = 'none';
                this.videoElement.pause();
            }
        }, this.fadeTransitionDuration);

        this.isVisible = false;
    }

    /**
     * Toggles the visibility of the video overlay.
     */
    public toggleOverlay(): void {
        if (this.isVisible) {
            this.hideOverlay();
        } else {
            this.showOverlay();
        }
    }

    /**
     * Changes the video source and optionally plays it immediately.
     * @param videoUrl - The URL of the new video source.
     * @param autoPlay - Whether the video should play immediately after loading.
     */
    public changeVideoSource(videoUrl: string, autoPlay: boolean = true): void {
        if (!this.videoElement) return;

        this.videoElement.src = videoUrl;
        this.videoElement.load();

        if (autoPlay) {
            this.showOverlay();
        }
    }

    /**
     * Gets the visibility state of the overlay.
     */
    public getIsVisible(): boolean {
        return this.isVisible;
    }

    /**
     * Cleans up the video overlay instance.
     */
    public destroy(): void {
        if (this.videoElement) {
            this.videoElement.pause();
            this.videoElement.src = '';
            this.videoElement = null;
        }
    }
}

/**
 * Checks if the browser supports HEVC alpha channel videos.
 * This is primarily supported in Safari.
 * @returns Whether HEVC alpha is supported.
 */
export function supportsHEVCAlpha(): boolean {
    const navigator = window.navigator;
    const ua = navigator.userAgent.toLowerCase();
    const hasMediaCapabilities = !!(
        navigator.mediaCapabilities &&
        navigator.mediaCapabilities.decodingInfo
    );
    const isSafari = (
        ua.indexOf('safari') !== -1 &&
        ua.indexOf('chrome') === -1 &&
        ua.indexOf('version/') !== -1
    );
    return isSafari && hasMediaCapabilities;
}

/**
 * Gets the appropriate video source based on browser support.
 * @param hevcSource - The HEVC/MOV source for Safari.
 * @param webmSource - The WebM source for other browsers.
 * @returns The appropriate video source URL.
 */
export function getOptimalVideoSource(hevcSource: string, webmSource: string): string {
    return supportsHEVCAlpha() ? hevcSource : webmSource;
}

export default TransparentVideoOverlay;
