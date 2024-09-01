// Copyright 2024 Scape Agency BV

/**
 * @title Transparent Video Overlay Handler
 * @notice Manages a transparent video overlay, controlling its visibility,
 * playback, and effects.
 * @dev Provides methods to show, hide, toggle, and dynamically change the
 * video source with visual effects.
 */
 class TransparentVideoOverlay {
    private videoElement: HTMLVideoElement;
    private isVisible: boolean = false;

    constructor(videoElementId: string) {
        this.videoElement = document.getElementById(
            videoElementId
        ) as HTMLVideoElement;
        this.setupVideo();
    }

    /**
     * @notice Initializes video settings and event listeners for enhanced
     * control.
     */
    private setupVideo() {
        this.videoElement.addEventListener(
            "ended", () => this.videoElement.play()
        ); // Ensure looping
        this.videoElement.addEventListener("loadeddata", () => {
            console.log("Video loaded successfully.");
        });
        this.videoElement.addEventListener("error", (e) => {
            console.error("Error loading video:", e);
        });
    }

    /**
     * @notice Shows the video overlay with a fade-in effect.
     * @dev Uses CSS transitions to create a fade-in effect.
     */
    public showOverlay() {
        this.videoElement.style.display = "block";
        this.videoElement.style.opacity = "0";
        setTimeout(() => {
            this.videoElement.style.opacity = "1";
            this.videoElement.play();
        }, 10); // Timeout to ensure CSS transition takes place
        this.isVisible = true;
    }

    /**
     * @notice Hides the video overlay with a fade-out effect.
     * @dev Uses CSS transitions to create a fade-out effect before pausing
     * and hiding the video.
     */
    public hideOverlay() {
        this.videoElement.style.opacity = "0";
        setTimeout(() => {
            this.videoElement.style.display = "none";
            this.videoElement.pause();
        }, 500); // Match timeout to CSS transition duration
        this.isVisible = false;
    }

    /**
     * @notice Toggles the visibility of the video overlay with effects.
     */
    public toggleOverlay() {
        if (this.isVisible) {
            this.hideOverlay();
        } else {
            this.showOverlay();
        }
    }

    /**
     * @notice Changes the video source and optionally plays it immediately.
     * @param videoUrl The URL of the new video source.
     * @param autoPlay Determines if the video should play immediately after
     * loading.
     */
    public changeVideoSource(videoUrl: string, autoPlay: boolean = true) {
        this.videoElement.src = videoUrl;
        this.videoElement.load(); // Reload video to apply new source
        if (autoPlay) {
            this.showOverlay();
        }
    }
}

// Example usage:
const videoOverlay = new TransparentVideoOverlay("videoOverlay");
videoOverlay.showOverlay(); // Show the overlay with fade-in effect







function supportsHEVCAlpha() {
    const navigator = window.navigator;
    const ua = navigator.userAgent.toLowerCase()
    const hasMediaCapabilities = !!(navigator.mediaCapabilities && navigator.mediaCapabilities.decodingInfo)
    const isSafari = ((ua.indexOf("safari") != -1) && (!(ua.indexOf("chrome")!= -1) && (ua.indexOf("version/")!= -1)))
    return isSafari && hasMediaCapabilities
}

// Here’s an example of how this comes together in HTML:

<video id="player" loop muted autoplay playsinline></video>

<script>
const player = document.getElementById("player");
player.src = supportsHEVCAlpha() ? "output.mov" : "output.webm";
</script>