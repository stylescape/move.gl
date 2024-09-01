// Copyright 2024 Scape Agency BV


/**
 * @title Screensaver Class
 * @notice Handles the activation and deactivation of a screensaver based on
 * user inactivity.
 * @dev This class provides methods to start and stop the screensaver, manage
 * media sources, and handle user interactions.
 */
 class Screensaver {

    private timeoutId: number | undefined;
    private readonly timeout: number;
    private screensaverElement: HTMLElement | undefined;
    private videoElement: HTMLVideoElement | undefined;
    private audioElement: HTMLAudioElement | undefined;
    private isActive: boolean = false;

    /**
     * @notice Initializes a new Screensaver instance.
     * @param timeout The inactivity timeout in milliseconds after which the
     * screensaver activates.
     * @param videoUrl The URL for the video to be played when the screensaver
     * activates.
     * @param audioUrl The URL for the audio to be played when the screensaver
     * activates.
     */
    constructor(timeout: number, videoUrl: string, audioUrl: string) {
        this.timeout = timeout;
        this.initializeElements();
        this.loadMedia(videoUrl, audioUrl);
        this.setupEventListeners();
    }

    /**
     * @notice Initializes HTML elements from the DOM.
     * @dev Queries the DOM to get the screensaver, video, and audio elements
     * by their IDs.
     */
    private initializeElements() {
        this.screensaverElement = document.getElementById("screensaver")!;
        this.videoElement = document.getElementById(
            "screensaverVideo"
        ) as HTMLVideoElement;
        this.audioElement = document.getElementById(
            "screensaverAudio"
        ) as HTMLAudioElement;
    }

    /**
     * @notice Loads media sources into the video and audio elements.
     * @param videoUrl The source URL of the video.
     * @param audioUrl The source URL of the audio.
     */
    private loadMedia(videoUrl: string, audioUrl: string) {
        this.videoElement.src = videoUrl;
        this.audioElement.src = audioUrl;
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
     * @notice Activates the screensaver, displaying elements and playing media.
     */
    private activateScreensaver = () => {
        this.screensaverElement.style.display = 'block';
        this.videoElement.play();
        this.audioElement.play();
        this.isActive = true;
    };

    /**
     * @notice Stops the screensaver and hides its elements.
     * @dev Pauses media playback and clears the activation timeout.
     */
    private stopScreensaver() {
        this.screensaverElement.style.display = 'none';
        this.videoElement.pause();
        this.audioElement.pause();
        this.isActive = false;

        if (this.timeoutId !== undefined) {
            clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
        }
    }

    /**
     * @notice Sets the volume for both video and audio elements of the
     * screensaver.
     * @param volume A number between 0.0 and 1.0 indicating the volume level.
     */
    public setVolume(volume: number) {
        this.videoElement.volume = volume;
        this.audioElement.volume = volume;
    }
}

// Example usage:
const screensaver = new Screensaver(
    300000,
    'path/to/video.mp4',
    'path/to/audio.mp3'
); // Initialize the screensaver with a 5-minute timeout
screensaver.setVolume(0.5); // Set initial volume to 50%
