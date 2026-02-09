// src/ts/Draggable.ts
var Draggable = class {
  /**
   * Creates a new Draggable instance.
   * @param elementId - The ID of the HTML element to make draggable.
   * @throws Error if element or parent element is not found.
   */
  constructor(elementId) {
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    /**
     * Initiates the drag operation.
     */
    this.startDrag = (event) => {
      const coords = this.getClientCoordinates(event);
      this.isDragging = true;
      this.startX = coords.clientX - this.element.offsetLeft;
      this.startY = coords.clientY - this.element.offsetTop;
      event.preventDefault();
    };
    /**
     * Handles the drag movement.
     */
    this.drag = (event) => {
      if (!this.isDragging) return;
      const coords = this.getClientCoordinates(event);
      let x = coords.clientX - this.startX;
      let y = coords.clientY - this.startY;
      x = Math.max(this.boundRect.left, Math.min(x, this.boundRect.right - this.element.offsetWidth));
      y = Math.max(this.boundRect.top, Math.min(y, this.boundRect.bottom - this.element.offsetHeight));
      this.element.style.left = `${x}px`;
      this.element.style.top = `${y}px`;
    };
    /**
     * Stops the drag operation.
     */
    this.stopDrag = () => {
      this.isDragging = false;
    };
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }
    this.element = element;
    const parent = this.element.parentElement;
    if (!parent) {
      throw new Error("Draggable element must have a parent element");
    }
    this.boundRect = parent.getBoundingClientRect();
    this.attachEventListeners();
  }
  /**
   * Attaches all necessary event listeners for drag functionality.
   */
  attachEventListeners() {
    this.element.addEventListener("mousedown", this.startDrag);
    this.element.addEventListener("touchstart", this.startDrag, { passive: false });
    document.addEventListener("mouseup", this.stopDrag);
    document.addEventListener("touchend", this.stopDrag);
    document.addEventListener("mousemove", this.drag);
    document.addEventListener("touchmove", this.drag, { passive: false });
  }
  /**
   * Gets the client coordinates from a mouse or touch event.
   */
  getClientCoordinates(event) {
    if ("touches" in event && event.touches.length > 0) {
      return {
        clientX: event.touches[0].clientX,
        clientY: event.touches[0].clientY
      };
    }
    return {
      clientX: event.clientX,
      clientY: event.clientY
    };
  }
  /**
   * Removes all event listeners and cleans up.
   */
  destroy() {
    this.element.removeEventListener("mousedown", this.startDrag);
    this.element.removeEventListener("touchstart", this.startDrag);
    document.removeEventListener("mouseup", this.stopDrag);
    document.removeEventListener("touchend", this.stopDrag);
    document.removeEventListener("mousemove", this.drag);
    document.removeEventListener("touchmove", this.drag);
  }
};

// src/ts/Screensaver.ts
var Screensaver = class {
  /**
   * Creates a new Screensaver instance.
   * @param options - Configuration options for the screensaver.
   */
  constructor(options) {
    this.screensaverElement = null;
    this.videoElement = null;
    this.audioElement = null;
    this.isActive = false;
    /**
     * @notice Resets the screensaver timer and stops the screensaver if
     * active.
     * @dev Called upon user interactions detected by event listeners.
     */
    this.resetScreensaver = () => {
      if (this.isActive) {
        this.stopScreensaver();
      }
      this.startScreensaverTimeout();
    };
    /**
     * Activates the screensaver, displaying elements and playing media.
     */
    this.activateScreensaver = () => {
      if (this.screensaverElement) {
        this.screensaverElement.style.display = "block";
      }
      this.videoElement?.play();
      this.audioElement?.play();
      this.isActive = true;
    };
    this.options = {
      containerId: "screensaver",
      videoId: "screensaverVideo",
      audioId: "screensaverAudio",
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
  initializeElements() {
    this.screensaverElement = document.getElementById(this.options.containerId);
    this.videoElement = document.getElementById(this.options.videoId);
    this.audioElement = document.getElementById(this.options.audioId);
  }
  /**
   * Loads media sources into the video and audio elements.
   * @param videoUrl - The source URL of the video.
   * @param audioUrl - The source URL of the audio.
   */
  loadMedia(videoUrl, audioUrl) {
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
  setupEventListeners() {
    ["mousemove", "keydown", "touchstart"].forEach((event) => {
      document.addEventListener(event, this.resetScreensaver);
    });
  }
  /**
   * @notice Starts or restarts the screensaver timeout.
   * @dev Resets any existing timeout and sets a new timeout to activate
   * the screensaver.
   */
  startScreensaverTimeout() {
    this.stopScreensaver();
    this.timeoutId = window.setTimeout(
      () => this.activateScreensaver(),
      this.timeout
    );
  }
  /**
   * Stops the screensaver and hides its elements.
   */
  stopScreensaver() {
    if (this.screensaverElement) {
      this.screensaverElement.style.display = "none";
    }
    this.videoElement?.pause();
    this.audioElement?.pause();
    this.isActive = false;
    if (this.timeoutId !== void 0) {
      clearTimeout(this.timeoutId);
      this.timeoutId = void 0;
    }
  }
  /**
   * Sets the volume for both video and audio elements.
   * @param volume - A number between 0.0 and 1.0 indicating the volume level.
   */
  setVolume(volume) {
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
  getIsActive() {
    return this.isActive;
  }
  /**
   * Cleans up event listeners and stops the screensaver.
   */
  destroy() {
    this.stopScreensaver();
    ["mousemove", "keydown", "touchstart"].forEach((event) => {
      document.removeEventListener(event, this.resetScreensaver);
    });
  }
};

// src/ts/Keyboard.ts
var VirtualKeyboard = class {
  /**
   * @notice Initializes the virtual keyboard with specific input and
   * keyboard element IDs.
   * @param inputId The ID of the HTML input element to which the keyboard
   * will be linked.
   * @param keyboardId The ID of the container element where the keyboard
   * will be rendered.
   */
  constructor(inputId, keyboardId) {
    this.keys = {
      "default": [
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
        ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
        ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
        ["z", "x", "c", "v", "b", "n", "m", "Backspace"]
      ],
      "shift": [
        ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")"],
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
        ["Z", "X", "C", "V", "B", "N", "M", "Backspace"]
      ],
      "special": [
        ["[", "]", "{", "}", "#", "%", "^", "*", "+", "="],
        ["_", "\\", "|", "~", "<", ">", "\u20AC", "\xA3", "\xA5"],
        [".", ",", "?", "!", "'", '"', ":", ";", "Backspace"]
      ]
    };
    this.currentMode = "default";
    /**
     * @notice Handles physical keyboard events and maps them to virtual key
     * presses.
     * @param event The keyboard event captured from the user"s physical
     * keyboard.
     */
    this.handlePhysicalKeyPress = (event) => {
      const key = event.key;
      if (key === "Shift" || key === "CapsLock") {
        this.toggleShift();
        event.preventDefault();
      } else if (key === "Enter" || key === "Tab") {
      } else {
        this.handleKeyPress(key);
      }
    };
    /**
     * @notice Handles touch events on the keyboard element.
     * @param event The touch event on the virtual keyboard.
     */
    this.handleTouchStart = (event) => {
      event.preventDefault();
      const keyElement = event.target;
      if (keyElement.classList.contains("key")) {
        this.handleKeyPress(keyElement.textContent || "");
      }
    };
    this.inputElement = document.getElementById(
      inputId
    );
    this.keyboardElement = document.getElementById(
      keyboardId
    );
    this.renderKeyboard();
    this.attachEventListeners();
  }
  /**
   * @notice Renders the keyboard based on the current mode (default, shift,
   * or special).
   * @dev Dynamically creates HTML for keyboard keys and appends them to the
   * keyboardElement.
   */
  renderKeyboard() {
    this.keyboardElement.innerHTML = "";
    this.keys[this.currentMode].forEach((row) => {
      const rowElement = document.createElement("div");
      rowElement.className = "keyboard__row";
      row.forEach((key) => {
        const keyElement = document.createElement("div");
        keyElement.textContent = key;
        keyElement.className = "key";
        keyElement.addEventListener(
          "click",
          () => this.handleKeyPress(key)
        );
        rowElement.appendChild(keyElement);
      });
      this.keyboardElement.appendChild(rowElement);
    });
  }
  /**
   * @notice Handles key presses on the virtual keyboard.
   * @param key The key character or function (like "Backspace") that was
   * pressed.
   */
  handleKeyPress(key) {
    if (key === "Backspace") {
      this.inputElement.value = this.inputElement.value.slice(0, -1);
    } else if (key === "Shift" || key === "CapsLock") {
      this.toggleShift();
    } else {
      this.inputElement.value += key;
    }
  }
  /**
   * @notice Toggles the keyboard between "default" and "shift" modes.
   * @dev This method is called when the "Shift" or "CapsLock" key is pressed.
   */
  toggleShift() {
    this.currentMode = this.currentMode === "default" ? "shift" : "default";
    this.renderKeyboard();
  }
  /**
   * @notice Attaches necessary event listeners to handle both physical
   * keyboard and touch inputs.
   */
  attachEventListeners() {
    document.addEventListener("keydown", this.handlePhysicalKeyPress);
    this.keyboardElement.addEventListener(
      "touchstart",
      this.handleTouchStart,
      false
    );
  }
  /**
   * @notice Switches the keyboard layout to a specified mode.
   * @param mode The mode to which the keyboard layout should switch
   * ("default", "shift", or "special").
   */
  switchMode(mode) {
    if (this.keys[mode]) {
      this.currentMode = mode;
      this.renderKeyboard();
    }
  }
  /**
   * Removes all event listeners and cleans up.
   */
  destroy() {
    document.removeEventListener("keydown", this.handlePhysicalKeyPress);
    this.keyboardElement.removeEventListener("touchstart", this.handleTouchStart);
    this.keyboardElement.innerHTML = "";
  }
};

// src/ts/Gesture.ts
var TouchGestureHandler = class {
  /**
   * Creates a new TouchGestureHandler instance.
   * @param elementId - The ID of the element to attach gesture handling to.
   * @param callbacks - Optional callback functions for gesture events.
   */
  constructor(elementId, callbacks = {}) {
    this.startTouches = null;
    this.lastTouches = null;
    this.isSwiping = false;
    this.isPinching = false;
    this.handleTouchStart = (event) => {
      if (event.touches.length === 1) {
        this.startTouches = Array.from(event.touches);
      } else if (event.touches.length > 1) {
        this.startTouches = Array.from(event.touches);
        this.isPinching = true;
      }
    };
    this.handleTouchMove = (event) => {
      if (!this.startTouches) return;
      this.lastTouches = Array.from(event.touches);
      if (event.touches.length === 1 && !this.isPinching) {
        const dx = event.touches[0].clientX - this.startTouches[0].clientX;
        const dy = event.touches[0].clientY - this.startTouches[0].clientY;
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          this.isSwiping = true;
        }
      } else if (event.touches.length > 1 && this.isPinching && this.startTouches.length > 1) {
        const startDistance = this.getDistance(this.startTouches[0], this.startTouches[1]);
        const currentDistance = this.getDistance(event.touches[0], event.touches[1]);
        const scale = currentDistance / startDistance;
        this.callbacks.onPinch?.(scale);
      }
    };
    this.handleTouchEnd = () => {
      if (this.isSwiping && this.startTouches && this.lastTouches) {
        const dx = this.lastTouches[0].clientX - this.startTouches[0].clientX;
        const dy = this.lastTouches[0].clientY - this.startTouches[0].clientY;
        const direction = this.getSwipeDirection(dx, dy);
        this.callbacks.onSwipe?.(direction, dx, dy);
        this.isSwiping = false;
      } else if (this.isPinching) {
        this.isPinching = false;
      } else {
        this.callbacks.onTap?.();
      }
      this.startTouches = null;
      this.lastTouches = null;
    };
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }
    this.element = element;
    this.callbacks = callbacks;
    this.addTouchListeners();
  }
  addTouchListeners() {
    this.element.addEventListener("touchstart", this.handleTouchStart, false);
    this.element.addEventListener("touchmove", this.handleTouchMove, false);
    this.element.addEventListener("touchend", this.handleTouchEnd, false);
  }
  /**
   * Determines swipe direction based on deltas.
   */
  getSwipeDirection(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? "right" : "left";
    }
    return dy > 0 ? "down" : "up";
  }
  /**
   * Calculates the distance between two touch points.
   */
  getDistance(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  /**
   * Removes all event listeners and cleans up.
   */
  destroy() {
    this.element.removeEventListener("touchstart", this.handleTouchStart);
    this.element.removeEventListener("touchmove", this.handleTouchMove);
    this.element.removeEventListener("touchend", this.handleTouchEnd);
  }
};
var AdvancedGestureRecognition = class {
  /**
   * Creates a new AdvancedGestureRecognition instance.
   * @param elementId - The ID of the element to attach gesture handling to.
   * @param callbacks - Optional callback functions for gesture events.
   */
  constructor(elementId, callbacks = {}) {
    this.ongoingTouches = /* @__PURE__ */ new Map();
    this.handleGestureStart = (event) => {
      this.ongoingTouches.set(event.pointerId, event);
      this.callbacks.onGestureStart?.(event);
    };
    this.handleGestureMove = (event) => {
      if (this.ongoingTouches.has(event.pointerId)) {
        const startEvent = this.ongoingTouches.get(event.pointerId);
        const dx = event.clientX - startEvent.clientX;
        const dy = event.clientY - startEvent.clientY;
        this.callbacks.onGestureMove?.(dx, dy, event);
      }
    };
    this.handleGestureEnd = (event) => {
      this.ongoingTouches.delete(event.pointerId);
      this.callbacks.onGestureEnd?.(event);
    };
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }
    this.element = element;
    this.callbacks = callbacks;
    this.attachEventListeners();
  }
  attachEventListeners() {
    this.element.addEventListener("pointerdown", this.handleGestureStart, { passive: false });
    this.element.addEventListener("pointermove", this.handleGestureMove, { passive: false });
    this.element.addEventListener("pointerup", this.handleGestureEnd, { passive: false });
    this.element.addEventListener("pointercancel", this.handleGestureEnd, { passive: false });
  }
  /**
   * Removes all event listeners and cleans up.
   */
  destroy() {
    this.element.removeEventListener("pointerdown", this.handleGestureStart);
    this.element.removeEventListener("pointermove", this.handleGestureMove);
    this.element.removeEventListener("pointerup", this.handleGestureEnd);
    this.element.removeEventListener("pointercancel", this.handleGestureEnd);
  }
};

// src/ts/VideoOverlay.ts
var TransparentVideoOverlay = class {
  /**
   * Creates a new TransparentVideoOverlay instance.
   * @param videoElementId - The ID of the video element to manage.
   * @param options - Optional configuration options.
   */
  constructor(videoElementId, options = {}) {
    this.videoElement = null;
    this.isVisible = false;
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
  setupVideo() {
    if (!this.videoElement) return;
    if (this.loop) {
      this.videoElement.addEventListener("ended", () => {
        this.videoElement?.play();
      });
    }
    this.videoElement.addEventListener("loadeddata", () => {
      console.log("Video loaded successfully.");
    });
    this.videoElement.addEventListener("error", (e) => {
      console.error("Error loading video:", e);
    });
    this.videoElement.style.transition = `opacity ${this.fadeTransitionDuration}ms ease`;
  }
  /**
   * Shows the video overlay with a fade-in effect.
   */
  showOverlay() {
    if (!this.videoElement) return;
    this.videoElement.style.display = "block";
    this.videoElement.style.opacity = "0";
    requestAnimationFrame(() => {
      if (this.videoElement) {
        this.videoElement.style.opacity = "1";
        this.videoElement.play().catch((err) => {
          console.warn("Auto-play prevented:", err);
        });
      }
    });
    this.isVisible = true;
  }
  /**
   * Hides the video overlay with a fade-out effect.
   */
  hideOverlay() {
    if (!this.videoElement) return;
    this.videoElement.style.opacity = "0";
    setTimeout(() => {
      if (this.videoElement) {
        this.videoElement.style.display = "none";
        this.videoElement.pause();
      }
    }, this.fadeTransitionDuration);
    this.isVisible = false;
  }
  /**
   * Toggles the visibility of the video overlay.
   */
  toggleOverlay() {
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
  changeVideoSource(videoUrl, autoPlay = true) {
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
  getIsVisible() {
    return this.isVisible;
  }
  /**
   * Cleans up the video overlay instance.
   */
  destroy() {
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.src = "";
      this.videoElement = null;
    }
  }
};
function supportsHEVCAlpha() {
  const navigator = window.navigator;
  const ua = navigator.userAgent.toLowerCase();
  const hasMediaCapabilities = !!(navigator.mediaCapabilities && navigator.mediaCapabilities.decodingInfo);
  const isSafari = ua.indexOf("safari") !== -1 && ua.indexOf("chrome") === -1 && ua.indexOf("version/") !== -1;
  return isSafari && hasMediaCapabilities;
}
function getOptimalVideoSource(hevcSource, webmSource) {
  return supportsHEVCAlpha() ? hevcSource : webmSource;
}

// src/ts/LoaderManager.ts
var LoaderManager = class {
  // ========================================================================
  // Constructor
  // ========================================================================
  /**
   * Creates a new LoaderManager instance.
   * @param preloadBuiltins - Whether to preload built-in loaders (default: true)
   */
  constructor(preloadBuiltins = true) {
    // ========================================================================
    // Properties
    // ========================================================================
    /** Registry of loader configurations */
    this.loaders = /* @__PURE__ */ new Map();
    /** Active loader instances */
    this.activeLoaders = /* @__PURE__ */ new Map();
    /** Default CSS variables for customization */
    this.defaultVars = {
      "--loader-size": "48px",
      "--loader-color": "#FFF",
      "--loader-accent": "#FF3D00",
      "--loader-speed": "1s"
    };
    if (preloadBuiltins) {
      this.registerBuiltinLoaders();
    }
  }
  // ========================================================================
  // Public Methods
  // ========================================================================
  /**
   * Registers a loader configuration.
   * @param config - The loader configuration to register
   * @returns The LoaderManager instance for chaining
   */
  register(config) {
    this.loaders.set(config.id, config);
    return this;
  }
  /**
   * Registers multiple loader configurations.
   * @param configs - Array of loader configurations
   * @returns The LoaderManager instance for chaining
   */
  registerAll(configs) {
    configs.forEach((config) => this.register(config));
    return this;
  }
  /**
   * Creates and mounts a loader element.
   * @param loaderId - ID of the registered loader to create
   * @param options - Creation options
   * @returns The created loader element
   */
  create(loaderId, options = {}) {
    const config = this.loaders.get(loaderId);
    if (!config) {
      throw new Error(`Loader "${loaderId}" not found. Register it first.`);
    }
    const {
      container,
      useShadowDOM = true,
      className = "",
      size,
      color,
      accentColor
    } = options;
    const wrapper = document.createElement("div");
    wrapper.className = `loader-wrapper ${className}`.trim();
    wrapper.setAttribute("data-loader-id", loaderId);
    if (size) {
      wrapper.style.setProperty("--loader-size", typeof size === "number" ? `${size}px` : size);
    }
    if (color) {
      wrapper.style.setProperty("--loader-color", color);
    }
    if (accentColor) {
      wrapper.style.setProperty("--loader-accent", accentColor);
    }
    if (useShadowDOM) {
      const shadowRoot = wrapper.attachShadow({ mode: "open" });
      const styleEl = document.createElement("style");
      styleEl.textContent = this.processCSS(config.css, options);
      shadowRoot.appendChild(styleEl);
      const loaderEl = document.createElement("span");
      loaderEl.className = "loader";
      if (config.content) {
        loaderEl.innerHTML = config.content;
      }
      shadowRoot.appendChild(loaderEl);
      this.activeLoaders.set(wrapper, { id: loaderId, shadowRoot });
    } else {
      const styleEl = document.createElement("style");
      styleEl.textContent = this.scopeCSS(config.css, wrapper, loaderId);
      wrapper.appendChild(styleEl);
      const loaderEl = document.createElement("span");
      loaderEl.className = `loader loader-${loaderId}`;
      if (config.content) {
        loaderEl.innerHTML = config.content;
      }
      wrapper.appendChild(loaderEl);
      this.activeLoaders.set(wrapper, { id: loaderId });
    }
    if (container) {
      const containerEl = typeof container === "string" ? document.querySelector(container) : container;
      containerEl?.appendChild(wrapper);
    }
    return wrapper;
  }
  /**
   * Creates a full-screen overlay loader.
   * @param loaderId - ID of the registered loader
   * @param options - Creation options
   * @returns The created overlay element
   */
  createOverlay(loaderId, options = {}) {
    const overlay = document.createElement("div");
    overlay.className = "loader-overlay";
    overlay.style.cssText = `
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9999;
        `;
    const loader = this.create(loaderId, { ...options, container: overlay });
    document.body.appendChild(overlay);
    this.activeLoaders.set(overlay, { id: `overlay-${loaderId}` });
    return overlay;
  }
  /**
   * Shows a loader in an existing element, replacing its content.
   * @param loaderId - ID of the registered loader
   * @param target - Target element or selector
   * @param options - Creation options
   * @returns The created loader element
   */
  showIn(loaderId, target, options = {}) {
    const targetEl = typeof target === "string" ? document.querySelector(target) : target;
    if (!targetEl) {
      throw new Error(`Target element not found: ${target}`);
    }
    const originalContent = targetEl.innerHTML;
    targetEl.setAttribute("data-original-content", originalContent);
    targetEl.innerHTML = "";
    const loader = this.create(loaderId, { ...options, container: targetEl });
    return loader;
  }
  /**
   * Hides a loader and restores original content.
   * @param target - Target element or selector
   */
  hideIn(target) {
    const targetEl = typeof target === "string" ? document.querySelector(target) : target;
    if (!targetEl) return;
    const originalContent = targetEl.getAttribute("data-original-content");
    if (originalContent !== null) {
      targetEl.innerHTML = originalContent;
      targetEl.removeAttribute("data-original-content");
    }
  }
  /**
   * Destroys a loader element.
   * @param loader - The loader element to destroy
   */
  destroy(loader) {
    this.activeLoaders.delete(loader);
    loader.remove();
  }
  /**
   * Destroys all active loaders.
   */
  destroyAll() {
    this.activeLoaders.forEach((_, loader) => this.destroy(loader));
  }
  /**
   * Gets a list of all registered loader IDs.
   * @returns Array of loader IDs
   */
  getRegisteredLoaders() {
    return Array.from(this.loaders.keys());
  }
  /**
   * Checks if a loader is registered.
   * @param loaderId - Loader ID to check
   * @returns True if registered
   */
  has(loaderId) {
    return this.loaders.has(loaderId);
  }
  /**
   * Gets the configuration for a registered loader.
   * @param loaderId - Loader ID
   * @returns The loader configuration or undefined
   */
  getConfig(loaderId) {
    return this.loaders.get(loaderId);
  }
  // ========================================================================
  // Private Methods
  // ========================================================================
  /**
   * Processes CSS with variable replacements.
   */
  processCSS(css, options) {
    let processed = css;
    processed = processed.replace(/#FFF\b/gi, "var(--loader-color, #FFF)");
    processed = processed.replace(/#FF3D00\b/gi, "var(--loader-accent, #FF3D00)");
    processed = processed.replace(/48px/g, "var(--loader-size, 48px)");
    return processed;
  }
  /**
   * Scopes CSS to a specific element (for non-Shadow DOM usage).
   */
  scopeCSS(css, wrapper, loaderId) {
    return css.replace(/\.loader/g, `.loader-${loaderId}`);
  }
  /**
   * Registers built-in loader presets.
   */
  registerBuiltinLoaders() {
    this.register({
      id: "spinner",
      css: `.loader {
                width: 48px;
                height: 48px;
                border: 5px solid #FFF;
                border-bottom-color: #FF3D00;
                border-radius: 50%;
                display: inline-block;
                box-sizing: border-box;
                animation: rotation 1s linear infinite;
            }
            @keyframes rotation {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }`
    });
    this.register({
      id: "spinner-dual",
      css: `.loader {
                width: 48px;
                height: 48px;
                border: 5px solid #FFF;
                border-bottom-color: transparent;
                border-radius: 50%;
                display: inline-block;
                box-sizing: border-box;
                animation: rotation 1s linear infinite;
            }
            @keyframes rotation {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }`
    });
    this.register({
      id: "dots-bounce",
      css: `.loader, .loader:before, .loader:after {
                border-radius: 50%;
                width: 2.5em;
                height: 2.5em;
                animation-fill-mode: both;
                animation: bblFadInOut 1.8s infinite ease-in-out;
            }
            .loader {
                color: #FFF;
                font-size: 7px;
                position: relative;
                text-indent: -9999em;
                transform: translateZ(0);
                animation-delay: -0.16s;
            }
            .loader:before, .loader:after {
                content: '';
                position: absolute;
                top: 0;
            }
            .loader:before {
                left: -3.5em;
                animation-delay: -0.32s;
            }
            .loader:after {
                left: 3.5em;
            }
            @keyframes bblFadInOut {
                0%, 80%, 100% { box-shadow: 0 2.5em 0 -1.3em }
                40% { box-shadow: 0 2.5em 0 0 }
            }`
    });
    this.register({
      id: "dots-flash",
      css: `.loader {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background-color: #fff;
                box-shadow: 32px 0 #fff, -32px 0 #fff;
                position: relative;
                animation: flash 0.5s ease-out infinite alternate;
            }
            @keyframes flash {
                0% {
                    background-color: #FFF2;
                    box-shadow: 32px 0 #FFF2, -32px 0 #FFF;
                }
                50% {
                    background-color: #FFF;
                    box-shadow: 32px 0 #FFF2, -32px 0 #FFF2;
                }
                100% {
                    background-color: #FFF2;
                    box-shadow: 32px 0 #FFF, -32px 0 #FFF2;
                }
            }`
    });
    this.register({
      id: "progress-bar",
      css: `.loader {
                width: 100%;
                height: 4.8px;
                display: inline-block;
                position: relative;
                background: rgba(255, 255, 255, 0.15);
                overflow: hidden;
            }
            .loader::after {
                content: '';
                width: 96px;
                height: 4.8px;
                background: #FFF;
                position: absolute;
                top: 0;
                left: 0;
                box-sizing: border-box;
                animation: hitZak 1s linear infinite alternate;
            }
            @keyframes hitZak {
                0% { left: 0; transform: translateX(-1%); }
                100% { left: 100%; transform: translateX(-99%); }
            }`
    });
    this.register({
      id: "progress-fill",
      css: `.loader {
                width: 100%;
                height: 4.8px;
                display: inline-block;
                position: relative;
                background: rgba(255, 255, 255, 0.15);
                overflow: hidden;
            }
            .loader::after {
                content: '';
                box-sizing: border-box;
                width: 0;
                height: 4.8px;
                background: #FFF;
                position: absolute;
                top: 0;
                left: 0;
                animation: animFw 10s linear infinite;
            }
            @keyframes animFw {
                0% { width: 0; }
                100% { width: 100%; }
            }`
    });
    this.register({
      id: "pulse",
      css: `.loader {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                display: inline-block;
                position: relative;
                background: #FFF;
                box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.5);
                animation: pulse 1.5s ease-out infinite;
            }
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.5); }
                100% { box-shadow: 0 0 0 30px rgba(255, 255, 255, 0); }
            }`
    });
    this.register({
      id: "square-flip",
      css: `.loader {
                width: 48px;
                height: 48px;
                display: inline-block;
                position: relative;
                background: #FFF;
                box-sizing: border-box;
                animation: flipX 1s linear infinite;
            }
            @keyframes flipX {
                0% { transform: perspective(200px) rotateX(0deg) rotateY(0deg); }
                50% { transform: perspective(200px) rotateX(-180deg) rotateY(0deg); }
                100% { transform: perspective(200px) rotateX(-180deg) rotateY(-180deg); }
            }`
    });
    this.register({
      id: "skeleton-card",
      css: `.loader {
                width: 320px;
                height: 150px;
                display: block;
                margin: auto;
                position: relative;
                background: #FFF;
                box-sizing: border-box;
            }
            .loader::after {
                content: '';
                width: calc(100% - 30px);
                height: calc(100% - 30px);
                top: 15px;
                left: 15px;
                position: absolute;
                background-image:
                    linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.5) 50%, transparent 80%),
                    linear-gradient(#DDD 56px, transparent 0),
                    linear-gradient(#DDD 24px, transparent 0),
                    linear-gradient(#DDD 18px, transparent 0),
                    linear-gradient(#DDD 66px, transparent 0);
                background-repeat: no-repeat;
                background-size: 75px 130px, 55px 56px, 160px 30px, 260px 20px, 290px 56px;
                background-position: 0% 0, 0 0, 70px 5px, 70px 38px, 0px 66px;
                box-sizing: border-box;
                animation: animloader 1s linear infinite;
            }
            @keyframes animloader {
                0% { background-position: 0% 0, 0 0, 70px 5px, 70px 38px, 0px 66px; }
                100% { background-position: 150% 0, 0 0, 70px 5px, 70px 38px, 0px 66px; }
            }`
    });
    this.register({
      id: "bars-wave",
      css: `.loader {
                color: #FFF;
                position: relative;
                font-size: 11px;
                background: #FFF;
                animation: escaleY 1s infinite ease-in-out;
                width: 1em;
                height: 4em;
                animation-delay: -0.16s;
            }
            .loader:before, .loader:after {
                content: '';
                position: absolute;
                top: 0;
                left: 2em;
                background: #FFF;
                width: 1em;
                height: 4em;
                animation: escaleY 1s infinite ease-in-out;
            }
            .loader:before {
                left: -2em;
                animation-delay: -0.32s;
            }
            @keyframes escaleY {
                0%, 80%, 100% { box-shadow: 0 0; height: 4em; }
                40% { box-shadow: 0 -2em; height: 5em; }
            }`
    });
  }
};
var loaderManager = new LoaderManager();

// src/ts/index.ts
var ts_default = {
  Draggable,
  LoaderManager,
  Screensaver,
  VirtualKeyboard,
  TouchGestureHandler,
  AdvancedGestureRecognition,
  TransparentVideoOverlay
};
export {
  AdvancedGestureRecognition,
  Draggable,
  LoaderManager,
  Screensaver,
  TouchGestureHandler,
  TransparentVideoOverlay,
  VirtualKeyboard,
  ts_default as default,
  getOptimalVideoSource,
  loaderManager,
  supportsHEVCAlpha
};
//# sourceMappingURL=index.mjs.map