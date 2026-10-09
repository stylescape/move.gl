// ============================================================================
// move.gl | Virtual Keyboard
// ============================================================================
// Copyright 2026 Scape Press BV
// Licensed under MIT License
// ============================================================================

/**
 * Keyboard layout configuration
 */
export interface KeyboardLayout {
    [mode: string]: string[][];
}

/**
 * Virtual Keyboard Configuration Options
 */
export interface VirtualKeyboardOptions {
    /** Custom keyboard layout; must define at least a "default" mode */
    layout?: KeyboardLayout;
    /** Callback when a key is pressed */
    onKeyPress?: (key: string) => void;
}

/**
 * Keys with a function instead of a character, mapped to their label.
 * "?123" and "ABC" switch between the "special" and "default" modes.
 */
const FUNCTION_KEYS: { [key: string]: string } = {
    "Backspace": "⌫",
    "Shift": "⇧",
    "CapsLock": "⇪",
    "Space": "Space",
    "?123": "?123",
    "ABC": "ABC",
};

const DEFAULT_LAYOUT: KeyboardLayout = {
    "default": [
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
        ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
        ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
        ["Shift", "z", "x", "c", "v", "b", "n", "m", "Backspace"],
        ["?123", "Space"]
    ],
    "shift": [
        ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")"],
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
        ["Shift", "Z", "X", "C", "V", "B", "N", "M", "Backspace"],
        ["?123", "Space"]
    ],
    "special": [
        ["[", "]", "{", "}", "#", "%", "^", "*", "+", "="],
        ["_", "\\", "|", "~", "<", ">", "€", "£", "¥"],
        [".", ",", "?", "!", "'", '"', ":", ";", "Backspace"],
        ["ABC", "Space"]
    ]
};

/**
 * Virtual Keyboard
 *
 * Renders an on-screen keyboard that types into a linked input. Supports
 * multiple layouts (default, shift, special), inserts at the caret, and
 * mirrors physical key presses made while the input is not focused.
 *
 * @example
 * ```typescript
 * const keyboard = new VirtualKeyboard('textInput', 'keyboard', {
 *     onKeyPress: (key) => console.log(key)
 * });
 * keyboard.switchMode('special');
 * ```
 */
export class VirtualKeyboard {

    private keys: KeyboardLayout;
    private currentMode = "default";
    private inputElement: HTMLInputElement | HTMLTextAreaElement;
    private keyboardElement: HTMLElement;
    private onKeyPress?: (key: string) => void;

    /**
     * @notice Initializes the virtual keyboard with specific input and
     * keyboard element IDs.
     * @param inputId The ID of the HTML input or textarea element to which
     * the keyboard will be linked.
     * @param keyboardId The ID of the container element where the keyboard
     * will be rendered.
     * @param options Optional layout and key press callback.
     * @throws Error if either element is not found.
     */
    constructor(inputId: string, keyboardId: string, options: VirtualKeyboardOptions = {}) {
        const inputElement = document.getElementById(inputId);
        if (!(inputElement instanceof HTMLInputElement || inputElement instanceof HTMLTextAreaElement)) {
            throw new Error(`Element with id "${inputId}" is not an input or textarea`);
        }
        const keyboardElement = document.getElementById(keyboardId);
        if (!keyboardElement) {
            throw new Error(`Element with id "${keyboardId}" not found`);
        }
        this.inputElement = inputElement;
        this.keyboardElement = keyboardElement;
        this.keys = options.layout ?? DEFAULT_LAYOUT;
        if (!this.keys[this.currentMode]) {
            throw new Error('Keyboard layout must define a "default" mode');
        }
        this.onKeyPress = options.onKeyPress;
        this.renderKeyboard();
        this.attachEventListeners();
    }

    /**
     * Returns the active layout mode.
     */
    public get mode(): string {
        return this.currentMode;
    }

    /**
     * @notice Renders the keyboard based on the current mode (default, shift,
     * or special).
     * @dev Keys are buttons carrying their value in `data-key`; clicks are
     * handled by one delegated listener on the keyboard element.
     */
    private renderKeyboard() {
        const rows = this.keys[this.currentMode].map(row => {
            const rowElement = document.createElement("div");
            rowElement.className = "keyboard__row";
            row.forEach(key => {
                const keyElement = document.createElement("button");
                keyElement.type = "button";
                keyElement.className = key in FUNCTION_KEYS ? "key key--function" : "key";
                keyElement.dataset.key = key;
                keyElement.textContent = FUNCTION_KEYS[key] ?? key;
                if (key in FUNCTION_KEYS) {
                    keyElement.setAttribute("aria-label", key);
                }
                if (key === "Shift" || key === "CapsLock") {
                    keyElement.setAttribute("aria-pressed", String(this.currentMode === "shift"));
                }
                rowElement.appendChild(keyElement);
            });
            return rowElement;
        });
        this.keyboardElement.replaceChildren(...rows);
    }

    /**
     * @notice Handles key presses on the virtual keyboard.
     * @param key The key character or function (like "Backspace") that was
     * pressed.
     */
    private handleKeyPress(key: string) {
        if (key === "Backspace") {
            this.deleteBackward();
        } else if (key === "Shift" || key === "CapsLock") {
            this.toggleShift();
        } else if (key === "?123") {
            this.switchMode("special");
        } else if (key === "ABC") {
            this.switchMode("default");
        } else {
            this.insertText(key === "Space" ? " " : key);
        }
        this.onKeyPress?.(key);
    }

    /**
     * Inserts text at the caret (replacing any selection) and notifies
     * listeners through a bubbling `input` event, like native typing does.
     */
    private insertText(text: string) {
        const input = this.inputElement;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        if (start === null || end === null) {
            // Input types such as "email" or "number" expose no selection.
            input.value += text;
        } else {
            input.setRangeText(text, start, end);
            input.setSelectionRange(start + text.length, start + text.length);
        }
        input.dispatchEvent(new Event("input", { bubbles: true }));
    }

    /**
     * Deletes the selection, or the character before the caret.
     */
    private deleteBackward() {
        const input = this.inputElement;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        if (start === null || end === null) {
            input.value = input.value.slice(0, -1);
        } else if (start !== end || start > 0) {
            const from = start === end ? start - 1 : start;
            input.setRangeText("", from, end);
            input.setSelectionRange(from, from);
        } else {
            return;
        }
        input.dispatchEvent(new Event("input", { bubbles: true }));
    }

    /**
     * @notice Toggles the keyboard between "default" and "shift" modes.
     * @dev This method is called when the "Shift" or "CapsLock" key is pressed.
     */
    private toggleShift() {
        this.switchMode(this.currentMode === "shift" ? "default" : "shift");
    }

    /**
     * @notice Attaches listeners for virtual key clicks and physical keys.
     */
    private attachEventListeners() {
        this.keyboardElement.addEventListener("click", this.handleClick);
        this.keyboardElement.addEventListener("pointerdown", this.preventFocusSteal);
        document.addEventListener("keydown", this.handlePhysicalKeyDown);
        document.addEventListener("keyup", this.handlePhysicalKeyUp);
    }

    private handleClick = (event: MouseEvent) => {
        const keyElement = (event.target as Element).closest<HTMLElement>("[data-key]");
        if (keyElement?.dataset.key && this.keyboardElement.contains(keyElement)) {
            this.handleKeyPress(keyElement.dataset.key);
        }
    };

    /**
     * Keeps focus (and the caret) in the input while keys are tapped.
     */
    private preventFocusSteal = (event: PointerEvent) => {
        if ((event.target as Element).closest("[data-key]")) {
            event.preventDefault();
        }
    };

    /**
     * @notice Mirrors physical key presses into the linked input.
     * @dev Skipped while the user types into the input itself or any other
     * editable field, which the browser already handles natively.
     */
    private handlePhysicalKeyDown = (event: KeyboardEvent) => {
        if (event.defaultPrevented || isEditable(event.target)) return;

        const key = event.key;
        if (key === "Shift") {
            if (!event.repeat && this.keys.shift) this.switchMode("shift");
        } else if (key === "CapsLock") {
            if (!event.repeat) this.toggleShift();
        } else if (event.ctrlKey || event.metaKey || event.altKey) {
            return;
        } else if (key === "Backspace") {
            this.deleteBackward();
            this.onKeyPress?.(key);
            event.preventDefault();
        } else if (key.length === 1) {
            // Single printable characters only, not "ArrowLeft", "Escape" etc.
            this.insertText(key);
            this.onKeyPress?.(key);
            event.preventDefault();
        }
    };

    private handlePhysicalKeyUp = (event: KeyboardEvent) => {
        if (event.key === "Shift" && this.currentMode === "shift" && !event.getModifierState("CapsLock")) {
            this.switchMode("default");
        }
    };

    /**
     * @notice Switches the keyboard layout to a specified mode.
     * @param mode The mode to which the keyboard layout should switch
     * ("default", "shift", or "special").
     */
    public switchMode(mode: string) {
        if (this.keys[mode] && mode !== this.currentMode) {
            this.currentMode = mode;
            this.renderKeyboard();
        }
    }

    /**
     * Removes all event listeners and cleans up.
     */
    public destroy(): void {
        this.keyboardElement.removeEventListener("click", this.handleClick);
        this.keyboardElement.removeEventListener("pointerdown", this.preventFocusSteal);
        document.removeEventListener("keydown", this.handlePhysicalKeyDown);
        document.removeEventListener("keyup", this.handlePhysicalKeyUp);
        this.keyboardElement.replaceChildren();
    }
}

function isEditable(target: EventTarget | null): boolean {
    return target instanceof HTMLElement && (
        target.isContentEditable ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
    );
}

export default VirtualKeyboard;
