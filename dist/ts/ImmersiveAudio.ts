/**
 * @title Immersive Audio Handler
 * @notice Provides control over spatial and immersive audio in web applications.
 */
 class ImmersiveAudioHandler {
    private audioContext: AudioContext;
    private listener: AudioListener;
    private soundSources: Map<string, AudioBufferSourceNode> = new Map();

    constructor() {
        this.audioContext = new AudioContext();
        this.listener = this.audioContext.listener;
    }

    public loadSound(url: string, id: string): Promise<void> {
        return fetch(url)
            .then(response => response.arrayBuffer())
            .then(buffer => this.audioContext.decodeAudioData(buffer))
            .then(decodedBuffer => {
                const source = this.audioContext.createBufferSource();
                source.buffer = decodedBuffer;
                source.connect(this.audioContext.destination);
                this.soundSources.set(id, source);
            });
    }

    public playSound(id: string) {
        const source = this.soundSources.get(id);
        if (source) {
            source.start();
        }
    }

    public stopSound(id: string) {
        const source = this.soundSources.get(id);
        if (source) {
            source.stop();
        }
    }
}
