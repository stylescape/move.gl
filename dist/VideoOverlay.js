export class TransparentVideoOverlay {
    constructor(videoElementId, options = {}) {
        var _a, _b;
        this.videoElement = null;
        this.isVisible = false;
        const element = document.getElementById(videoElementId);
        if (element instanceof HTMLVideoElement) {
            this.videoElement = element;
        }
        else {
            console.warn(`Element with id "${videoElementId}" is not a video element`);
        }
        this.fadeTransitionDuration = (_a = options.fadeTransitionDuration) !== null && _a !== void 0 ? _a : 500;
        this.loop = (_b = options.loop) !== null && _b !== void 0 ? _b : true;
        if (this.videoElement) {
            this.setupVideo();
            if (options.initialSource) {
                this.changeVideoSource(options.initialSource, false);
            }
        }
    }
    setupVideo() {
        if (!this.videoElement)
            return;
        if (this.loop) {
            this.videoElement.addEventListener('ended', () => {
                var _a;
                (_a = this.videoElement) === null || _a === void 0 ? void 0 : _a.play();
            });
        }
        this.videoElement.addEventListener('loadeddata', () => {
            console.log('Video loaded successfully.');
        });
        this.videoElement.addEventListener('error', (e) => {
            console.error('Error loading video:', e);
        });
        this.videoElement.style.transition = `opacity ${this.fadeTransitionDuration}ms ease`;
    }
    showOverlay() {
        if (!this.videoElement)
            return;
        this.videoElement.style.display = 'block';
        this.videoElement.style.opacity = '0';
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
    hideOverlay() {
        if (!this.videoElement)
            return;
        this.videoElement.style.opacity = '0';
        setTimeout(() => {
            if (this.videoElement) {
                this.videoElement.style.display = 'none';
                this.videoElement.pause();
            }
        }, this.fadeTransitionDuration);
        this.isVisible = false;
    }
    toggleOverlay() {
        if (this.isVisible) {
            this.hideOverlay();
        }
        else {
            this.showOverlay();
        }
    }
    changeVideoSource(videoUrl, autoPlay = true) {
        if (!this.videoElement)
            return;
        this.videoElement.src = videoUrl;
        this.videoElement.load();
        if (autoPlay) {
            this.showOverlay();
        }
    }
    getIsVisible() {
        return this.isVisible;
    }
    destroy() {
        if (this.videoElement) {
            this.videoElement.pause();
            this.videoElement.src = '';
            this.videoElement = null;
        }
    }
}
export function supportsHEVCAlpha() {
    const navigator = window.navigator;
    const ua = navigator.userAgent.toLowerCase();
    const hasMediaCapabilities = !!(navigator.mediaCapabilities &&
        navigator.mediaCapabilities.decodingInfo);
    const isSafari = (ua.indexOf('safari') !== -1 &&
        ua.indexOf('chrome') === -1 &&
        ua.indexOf('version/') !== -1);
    return isSafari && hasMediaCapabilities;
}
export function getOptimalVideoSource(hevcSource, webmSource) {
    return supportsHEVCAlpha() ? hevcSource : webmSource;
}
export default TransparentVideoOverlay;
//# sourceMappingURL=VideoOverlay.js.map