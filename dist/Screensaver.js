export class Screensaver {
    constructor(options) {
        this.screensaverElement = null;
        this.videoElement = null;
        this.audioElement = null;
        this.isActive = false;
        this.resetScreensaver = () => {
            if (this.isActive) {
                this.stopScreensaver();
            }
            this.startScreensaverTimeout();
        };
        this.activateScreensaver = () => {
            var _a, _b;
            if (this.screensaverElement) {
                this.screensaverElement.style.display = 'block';
            }
            (_a = this.videoElement) === null || _a === void 0 ? void 0 : _a.play();
            (_b = this.audioElement) === null || _b === void 0 ? void 0 : _b.play();
            this.isActive = true;
        };
        this.options = Object.assign({ containerId: 'screensaver', videoId: 'screensaverVideo', audioId: 'screensaverAudio' }, options);
        this.timeout = options.timeout;
        this.initializeElements();
        if (options.videoUrl && options.audioUrl) {
            this.loadMedia(options.videoUrl, options.audioUrl);
        }
        this.setupEventListeners();
        this.startScreensaverTimeout();
    }
    initializeElements() {
        this.screensaverElement = document.getElementById(this.options.containerId);
        this.videoElement = document.getElementById(this.options.videoId);
        this.audioElement = document.getElementById(this.options.audioId);
    }
    loadMedia(videoUrl, audioUrl) {
        if (this.videoElement) {
            this.videoElement.src = videoUrl;
        }
        if (this.audioElement) {
            this.audioElement.src = audioUrl;
        }
    }
    setupEventListeners() {
        ['mousemove', 'keydown', 'touchstart'].forEach(event => {
            document.addEventListener(event, this.resetScreensaver);
        });
    }
    startScreensaverTimeout() {
        this.stopScreensaver();
        this.timeoutId = window.setTimeout(() => this.activateScreensaver(), this.timeout);
    }
    stopScreensaver() {
        var _a, _b;
        if (this.screensaverElement) {
            this.screensaverElement.style.display = 'none';
        }
        (_a = this.videoElement) === null || _a === void 0 ? void 0 : _a.pause();
        (_b = this.audioElement) === null || _b === void 0 ? void 0 : _b.pause();
        this.isActive = false;
        if (this.timeoutId !== undefined) {
            clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
        }
    }
    setVolume(volume) {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        if (this.videoElement) {
            this.videoElement.volume = clampedVolume;
        }
        if (this.audioElement) {
            this.audioElement.volume = clampedVolume;
        }
    }
    getIsActive() {
        return this.isActive;
    }
    destroy() {
        this.stopScreensaver();
        ['mousemove', 'keydown', 'touchstart'].forEach(event => {
            document.removeEventListener(event, this.resetScreensaver);
        });
    }
}
export default Screensaver;
//# sourceMappingURL=Screensaver.js.map