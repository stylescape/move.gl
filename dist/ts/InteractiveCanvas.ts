// Copyright 2024 Scape Agency BV



// Interactive Canvas Class
// A class for an interactive canvas can enable users to draw, which is
// beneficial for applications like signature pads, drawing tools, or educational apps.


/**
 * @title Interactive Canvas for Drawing
 * @notice This class enables drawing functionalities on a canvas element, supporting features like brush customization, undo/redo actions, and touch responsiveness.
 * @dev Implements event listeners for both mouse and touch interactions, provides methods for brush customization, and maintains a history stack for undo/redo capabilities.
 */
 class InteractiveCanvas {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private painting: boolean = false;
    private brushSize: number = 5;
    private brushColor: string = '#000000';
    private lineOpacity: number = 1.0;
    private history: ImageData[] = [];
    private historyStep: number = 0;

    /**
     * Constructs an InteractiveCanvas instance linked to a specific canvas element.
     * @param canvasId The DOM ID of the canvas element.
     */
    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.context = this.canvas.getContext('2d')!;
        this.setupCanvas();
        this.attachEventListeners();
    }

    /**
     * Sets up the canvas drawing context and adjusts the canvas size to its initial container.
     */
    private setupCanvas() {
        this.context.lineWidth = this.brushSize;
        this.context.lineCap = 'round';
        this.context.strokeStyle = this.brushColor;
        this.context.globalAlpha = this.lineOpacity;
        window.addEventListener('resize', this.resizeCanvas);
        this.resizeCanvas();
    }

    /**
     * Attaches necessary event listeners for mouse and touch interactions.
     */
    private attachEventListeners() {
        this.canvas.addEventListener('mousedown', this.startPaint);
        this.canvas.addEventListener('mouseup', this.endPaint);
        this.canvas.addEventListener('mousemove', this.paint);
        this.canvas.addEventListener('touchstart', this.startPaint, { passive: false });
        this.canvas.addEventListener('touchend', this.endPaint);
        this.canvas.addEventListener('touchmove', this.paint, { passive: false });
    }

    /**
     * Adjusts the canvas size to fit its container, ensuring that it is responsive to window size changes.
     */
    private resizeCanvas = () => {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    };

    /**
     * Initiates painting on the canvas, records the initial position, and saves the state for undo functionality.
     * @param event Mouse or touch event that triggers the start of painting.
     */
    private startPaint = (event: MouseEvent | TouchEvent) => {
        event.preventDefault();
        this.painting = true;
        const pos = this.getEventPosition(event);
        this.context.moveTo(pos.x, pos.y);
        this.context.beginPath();
        this.saveState();
    };

    /**
     * Stops the painting process on the canvas.
     */
    private endPaint = () => {
        this.painting = false;
    };

    /**
     * Continues the painting process, drawing lines based on mouse or touch movements.
     * @param event Mouse or touch event containing the current position for painting.
     */
    private paint = (event: MouseEvent | TouchEvent) => {
        if (!this.painting) return;
        const pos = this.getEventPosition(event);
        this.context.lineTo(pos.x, pos.y);
        this.context.stroke();
    };

    /**
     * Calculates the precise position of the mouse or touch event relative to the canvas.
     * @param event Mouse or touch event.
     * @returns The calculated position as an object with x and y coordinates.
     */
    private getEventPosition(event: MouseEvent | TouchEvent) {
        if (event instanceof TouchEvent) {
            const rect = this.canvas.getBoundingClientRect();
            const touch = event.touches[0];
            return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
        } else {
            return { x: event.clientX - this.canvas.offsetLeft, y: event.clientY - this.canvas.offsetTop };
        }
    }

    /**
     * Sets the brush size for painting.
     * @param size New brush size.
     */
    public setBrushSize(size: number) {
        this.brushSize = size;
        this.context.lineWidth = size;
    }

    /**
     * Sets the color of the brush.
     * @param color New brush color in CSS format.
     */
    public setBrushColor(color: string) {
        this.brushColor = color;
        this.context.strokeStyle = color;
    }

    /**
     * Sets the opacity of the brush strokes.
     * @param opacity A value between 0.0 (fully transparent) and 1.0 (fully opaque).
     */
    public setOpacity(opacity: number) {
        this.lineOpacity = opacity;
        this.context.globalAlpha = opacity;
    }

    /**
     * Undoes the last action taken on the canvas, reverting to the previous state.
     */
    public undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            this.context.putImageData(this.history[this.historyStep], 0, 0);
        }
    }

    /**
     * Redoes an action that was previously undone on the canvas, if possible.
     */
    public redo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            this.context.putImageData(this.history[this.historyStep], 0, 0);
        }
    }

    /**
     * Saves the current state of the canvas for future undo operations.
     */
    private saveState() {
        if (this.historyStep < this.history.length) this.history.splice(this.historyStep);
        this.history.push(this.context.getImageData(0, 0, this.canvas.width, this.canvas.height));
        this.historyStep = this.history.length;
    }

    /**
     * Clears the entire canvas and saves the state for undo functionality.
     */
    public clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.saveState();
    }
}
