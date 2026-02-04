export class VirtualKeyboard {
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
                ["_", "\\", "|", "~", "<", ">", "€", "£", "¥"],
                [".", ",", "?", "!", "'", '"', ":", ";", "Backspace"]
            ]
        };
        this.currentMode = "default";
        this.handlePhysicalKeyPress = (event) => {
            const key = event.key;
            if (key === "Shift" || key === "CapsLock") {
                this.toggleShift();
                event.preventDefault();
            }
            else if (key === "Enter" || key === "Tab") {
            }
            else {
                this.handleKeyPress(key);
            }
        };
        this.handleTouchStart = (event) => {
            event.preventDefault();
            const keyElement = event.target;
            if (keyElement.classList.contains("key")) {
                this.handleKeyPress(keyElement.textContent || "");
            }
        };
        this.inputElement = document.getElementById(inputId);
        this.keyboardElement = document.getElementById(keyboardId);
        this.renderKeyboard();
        this.attachEventListeners();
    }
    renderKeyboard() {
        this.keyboardElement.innerHTML = "";
        this.keys[this.currentMode].forEach(row => {
            const rowElement = document.createElement("div");
            row.forEach(key => {
                const keyElement = document.createElement("div");
                keyElement.textContent = key;
                keyElement.className = "key";
                keyElement.addEventListener("click", () => this.handleKeyPress(key));
                rowElement.appendChild(keyElement);
            });
            this.keyboardElement.appendChild(rowElement);
        });
    }
    handleKeyPress(key) {
        if (key === "Backspace") {
            this.inputElement.value = this.inputElement.value.slice(0, -1);
        }
        else if (key === "Shift" || key === "CapsLock") {
            this.toggleShift();
        }
        else {
            this.inputElement.value += key;
        }
    }
    toggleShift() {
        this.currentMode = this.currentMode === "default" ? "shift" : "default";
        this.renderKeyboard();
    }
    attachEventListeners() {
        document.addEventListener("keydown", this.handlePhysicalKeyPress);
        this.keyboardElement.addEventListener("touchstart", this.handleTouchStart, false);
    }
    switchMode(mode) {
        if (this.keys[mode]) {
            this.currentMode = mode;
            this.renderKeyboard();
        }
    }
    destroy() {
        document.removeEventListener('keydown', this.handlePhysicalKeyPress);
        this.keyboardElement.removeEventListener('touchstart', this.handleTouchStart);
        this.keyboardElement.innerHTML = '';
    }
}
export default VirtualKeyboard;
//# sourceMappingURL=Keyboard.js.map