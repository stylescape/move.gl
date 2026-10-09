// ============================================================================
// move.gl | Screensaver
// ============================================================================
// Copyright 2026 Scape Press BV
// Licensed under MIT License
// ============================================================================

/**
 * Screensaver Configuration Options
 */
export interface ScreensaverOptions {
    /** Inactivity timeout in milliseconds */
    timeout: number;
    /** URL for the video to play */
    videoUrl?: string;
    /** URL for the audio to play */
    audioUrl?: string;
    /** ID of the screensaver container element */
    containerId?: string;
    /** ID of the video element */
    videoId?: string;
    /** ID of the audio element */
    audioId?: string;
}

/**
 * Screensaver Class
 *
 * Handles the activation and deactivation of a screensaver based on
 * user inactivity. Provides methods to start and stop the screensaver,
 * manage media sources, and handle user interactions.
 *
 * @example
 * ```typescript
 * const screensaver = new Screensaver({
 *     timeout: 300000, // 5 minutes
 *     videoUrl: 'path/to/video.mp4',
 *     audioUrl: 'path/to/audio.mp3'
 * });
 * screensaver.setVolume(0.5);
 * ```
 */
export class Screensaver {
    private timeoutId: number | undefined;
    private readonly timeout: number;
    private screensaverElement: HTMLElement | null = null;
    private videoElement: HTMLVideoElement | null = null;
    private audioElement: HTMLAudioElement | null = null;
    private isActive: boolean = false;
    private readonly options: ScreensaverOptions;

    /** User activity that dismisses the screensaver and restarts the timer */
    private static readonly ACTIVITY_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'];

    /**
     * Creates a new Screensaver instance.
     * @param options - Configuration options for the screensaver.
     */
    constructor(options: ScreensaverOptions) {
        this.options = {
            containerId: 'screensaver',
            videoId: 'screensaverVideo',
            audioId: 'screensaverAudio',
            ...options
        };
        this.timeout = options.timeout;
        this.initializeElements();
        this.loadMedia(options.videoUrl, options.audioUrl);
        this.setupEventListeners();
        this.stopScreensaver();
        this.startScreensaverTimeout();
    }

    /**
     * Initializes HTML elements from the DOM.
     */
    private initializeElements(): void {
        this.screensaverElement = document.getElementById(this.options.containerId!);
        this.videoElement = document.getElementById(this.options.videoId!) as HTMLVideoElement | null;
        this.audioElement = document.getElementById(this.options.audioId!) as HTMLAudioElement | null;
    }

    /**
     * Loads media sources into the video and audio elements.
     * @param videoUrl - The source URL of the video, if any.
     * @param audioUrl - The source URL of the audio, if any.
     */
    private loadMedia(videoUrl?: string, audioUrl?: string): void {
        if (this.videoElement && videoUrl) {
            this.videoElement.src = videoUrl;
        }
        if (this.audioElement && audioUrl) {
            this.audioElement.src = audioUrl;
        }
    }

    /**
     * @notice Sets up event listeners for user interaction to prevent
     * screensaver activation.
     * @dev Listens for pointer, keyboard, wheel and touch events to reset
     * the screensaver timer.
     */
    private setupEventListeners() {
        Screensaver.ACTIVITY_EVENTS.forEach(event => {
            document.addEventListener(event, this.resetScreensaver, { passive: true });
        });
    }

    /**
     * @notice Starts or restarts the screensaver timeout.
     * @dev Clears any pending timeout and sets a new one to activate the
     * screensaver. Runs on every activity event, so it only touches the timer.
     */
    private startScreensaverTimeout() {
        this.clearScreensaverTimeout();
        this.timeoutId = window.setTimeout(this.activateScreensaver, this.timeout);
    }

    private clearScreensaverTimeout() {
        if (this.timeoutId !== undefined) {
            clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
        }
    }

    /**
     * @notice Resets the screensaver timer and stops the screensaver if
     * active.
     * @dev Called upon user interactions detected by event listeners.
     */
    private resetScreensaver = () => {
        if (this.isActive) {
            this.stopScreensaver();
        }
        this.startScreensaverTimeout();
    };

    /**
     * Activates the screensaver, displaying elements and playing media.
     */
    private activateScreensaver = (): void => {
        this.clearScreensaverTimeout();
        if (this.screensaverElement) {
            this.screensaverElement.style.display = 'block';
        }
        // play() rejects when autoplay is blocked (e.g. audio before any user
        // gesture); the screensaver still shows, just without that media.
        this.videoElement?.play().catch(() => undefined);
        this.audioElement?.play().catch(() => undefined);
        this.isActive = true;
    };

    /**
     * Shows the screensaver immediately, without waiting for the timeout.
     * The next user activity dismisses it as usual.
     */
    public start(): void {
        this.activateScreensaver();
    }

    /**
     * Hides the screensaver and restarts the inactivity timer.
     */
    public stop(): void {
        this.resetScreensaver();
    }

    /**
     * Stops the screensaver, hides its elements and cancels the pending
     * timer. Use `stop()` to also restart the inactivity timer.
     */
    public stopScreensaver(): void {
        if (this.screensaverElement) {
            this.screensaverElement.style.display = 'none';
        }
        this.videoElement?.pause();
        this.audioElement?.pause();
        this.isActive = false;
        this.clearScreensaverTimeout();
    }

    /**
     * Sets the volume for both video and audio elements.
     * @param volume - A number between 0.0 and 1.0 indicating the volume level.
     */
    public setVolume(volume: number): void {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        if (this.videoElement) {
            this.videoElement.volume = clampedVolume;
        }
        if (this.audioElement) {
            this.audioElement.volume = clampedVolume;
        }
    }

    /**
     * Returns whether the screensaver is currently active.
     */
    public getIsActive(): boolean {
        return this.isActive;
    }

    /**
     * Cleans up event listeners and stops the screensaver.
     */
    public destroy(): void {
        this.stopScreensaver();
        Screensaver.ACTIVITY_EVENTS.forEach(event => {
            document.removeEventListener(event, this.resetScreensaver);
        });
    }
}

export default Screensaver;
