// Copyright 2024 Scape Agency BV


/**
 * @title Virtual Keyboard
 * @notice Manages the rendering and interaction of a virtual keyboard on
 * the web.
 * @dev This class supports multiple layouts (default, shift, special) and
 * handles both mouse and keyboard inputs, including touch support.
 */
 class VirtualKeyboard {

    private keys: { [mode: string]: string[][] } = {
        'default': [
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
            ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
            ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace']
        ],
        'shift': [
            ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace']
        ],
        'special': [
            ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='],
            ['_', '\\', '|', '~', '<', '>', '€', '£', '¥'],
            ['.', ',', '?', '!', "'", '"', ':', ';', 'Backspace']
        ]
    };
    private currentMode = 'default';
    private inputElement: HTMLInputElement;
    private keyboardElement: HTMLElement;

    /**
     * @notice Initializes the virtual keyboard with specific input and
     * keyboard element IDs.
     * @param inputId The ID of the HTML input element to which the keyboard
     * will be linked.
     * @param keyboardId The ID of the container element where the keyboard
     * will be rendered.
     */
    constructor(inputId: string, keyboardId: string) {
        this.inputElement = document.getElementById(
            inputId
        ) as HTMLInputElement;
        this.keyboardElement = document.getElementById(
            keyboardId
        ) as HTMLElement;
        this.renderKeyboard();
        this.attachEventListeners();
    }

    /**
     * @notice Renders the keyboard based on the current mode (default, shift,
     * or special).
     * @dev Dynamically creates HTML for keyboard keys and appends them to the
     * keyboardElement.
     */
    private renderKeyboard() {
        // Clear existing keys
        this.keyboardElement.innerHTML = '';
        this.keys[this.currentMode].forEach(row => {
            const rowElement = document.createElement('div');
            row.forEach(key => {
                const keyElement = document.createElement('div');
                keyElement.textContent = key;
                // Assign a class for easier CSS styling
                keyElement.className = 'key';
                keyElement.addEventListener(
                    'click', () => this.handleKeyPress(key)
                );
                rowElement.appendChild(keyElement);
            });
            this.keyboardElement.appendChild(rowElement);
        });
    }

    /**
     * @notice Handles key presses on the virtual keyboard.
     * @param key The key character or function (like 'Backspace') that was
     * pressed.
     */
    private handleKeyPress(key: string) {
        if (key === 'Backspace') {
            this.inputElement.value = this.inputElement.value.slice(0, -1);
        } else if (key === 'Shift' || key === 'CapsLock') {
            this.toggleShift();
        } else {
            this.inputElement.value += key;
        }
    }

    /**
     * @notice Toggles the keyboard between 'default' and 'shift' modes.
     * @dev This method is called when the 'Shift' or 'CapsLock' key is pressed.
     */
    private toggleShift() {
        this.currentMode = this.currentMode === 'default' ? 'shift' : 'default';
        this.renderKeyboard();
    }

    /**
     * @notice Attaches necessary event listeners to handle both physical
     * keyboard and touch inputs.
     */
    private attachEventListeners() {
        document.addEventListener('keydown', this.handlePhysicalKeyPress);
        this.keyboardElement.addEventListener(
            'touchstart', this.handleTouchStart, false
        );
    }

    /**
     * @notice Handles physical keyboard events and maps them to virtual key
     * presses.
     * @param event The keyboard event captured from the user's physical
     * keyboard.
     */
    private handlePhysicalKeyPress = (event: KeyboardEvent) => {
        const key = event.key;
        if (key === 'Shift' || key === 'CapsLock') {
            this.toggleShift();
            event.preventDefault();
        } else if (key === 'Enter' || key === 'Tab') {
            // Optional: Implement behavior for Enter and Tab if needed
        } else {
            this.handleKeyPress(key);
        }
    };

    /**
     * @notice Handles touch events on the keyboard element.
     * @param event The touch event on the virtual keyboard.
     */
    private handleTouchStart = (event: TouchEvent) => {
        event.preventDefault(); // Prevents emulating mouse events
        const keyElement = event.target as HTMLElement;
        if (keyElement.classList.contains('key')) {
            this.handleKeyPress(keyElement.textContent || '');
        }
    };

    /**
     * @notice Switches the keyboard layout to a specified mode.
     * @param mode The mode to which the keyboard layout should switch
     * ('default', 'shift', or 'special').
     */
    public switchMode(mode: string) {
        if (this.keys[mode]) {
            this.currentMode = mode;
            this.renderKeyboard();
        }
    }
}

// Example usage:
const keyboard = new VirtualKeyboard('textInput', 'keyboard');
document.getElementById(
    'switchToSpecial'
).addEventListener('click', () => keyboard.switchMode('special'));
