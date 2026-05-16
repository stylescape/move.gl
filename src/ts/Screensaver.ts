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
        if (options.videoUrl && options.audioUrl) {
            this.loadMedia(options.videoUrl, options.audioUrl);
        }
        this.setupEventListeners();
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
     * @param videoUrl - The source URL of the video.
     * @param audioUrl - The source URL of the audio.
     */
    private loadMedia(videoUrl: string, audioUrl: string): void {
        if (this.videoElement) {
            this.videoElement.src = videoUrl;
        }
        if (this.audioElement) {
            this.audioElement.src = audioUrl;
        }
    }

    /**
     * @notice Sets up event listeners for user interaction to prevent
     * screensaver activation.
     * @dev Listens for 'mousemove', 'keydown', and 'touchstart' events
     * to reset the screensaver timer.
     */
    private setupEventListeners() {
        ['mousemove', 'keydown', 'touchstart'].forEach(event => {
            document.addEventListener(event, this.resetScreensaver);
        });
    }

    /**
     * @notice Starts or restarts the screensaver timeout.
     * @dev Resets any existing timeout and sets a new timeout to activate
     * the screensaver.
     */
    private startScreensaverTimeout() {
        this.stopScreensaver(); // Stop existing screensaver if active
        this.timeoutId = window.setTimeout(
            () => this.activateScreensaver(), this.timeout
        );
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
        if (this.screensaverElement) {
            this.screensaverElement.style.display = 'block';
        }
        this.videoElement?.play();
        this.audioElement?.play();
        this.isActive = true;
    };

    /**
     * Stops the screensaver and hides its elements.
     */
    public stopScreensaver(): void {
        if (this.screensaverElement) {
            this.screensaverElement.style.display = 'none';
        }
        this.videoElement?.pause();
        this.audioElement?.pause();
        this.isActive = false;

        if (this.timeoutId !== undefined) {
            clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
        }
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
        ['mousemove', 'keydown', 'touchstart'].forEach(event => {
            document.removeEventListener(event, this.resetScreensaver);
        });
    }
}

export default Screensaver;
