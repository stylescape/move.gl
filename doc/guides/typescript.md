# TypeScript Reference

All components are exported from the package root:

```typescript
import { Draggable, VirtualKeyboard, loaderManager } from 'move.gl';
```


## Draggable

Moves a positioned element by setting its `left`/`top`. Works with mouse, touch and pen.

```typescript
const draggable = new Draggable(elementId: string, {
  constrainToParent?: boolean,   // default: true
  dragCursor?: string,           // default: 'grabbing'
  onDragStart?: (x: number, y: number) => void,
  onDrag?: (x: number, y: number) => void,
  onDragEnd?: (x: number, y: number) => void
});
draggable.isDragging; // boolean
draggable.destroy(); // Clean up
```

## TouchGestureHandler

```typescript
const handler = new TouchGestureHandler(elementId: string, {
  onTap?: () => void,
  onSwipe?: (direction: SwipeDirection, dx: number, dy: number) => void,
  onPinch?: (scale: number) => void,
  onRotate?: (angle: number) => void   // degrees since the gesture started
});
handler.destroy(); // Clean up
```

## AdvancedGestureRecognition

Pointer-event based (mouse, touch, pen); reports movement relative to where each pointer went down.

```typescript
const gesture = new AdvancedGestureRecognition(elementId: string, {
  onGestureStart?: (event: PointerEvent) => void,
  onGestureMove?: (dx: number, dy: number, event: PointerEvent) => void,
  onGestureEnd?: (event: PointerEvent) => void
});
gesture.destroy();
```

## VirtualKeyboard

Renders `<button class="key">` elements into a container and types into an input or textarea at the caret. Physical key presses are mirrored into the input while no other field has focus.

```typescript
const keyboard = new VirtualKeyboard(inputId: string, keyboardId: string, {
  layout?: KeyboardLayout,             // { default: string[][], shift?: ..., special?: ... }
  onKeyPress?: (key: string) => void
});
keyboard.switchMode('special');
keyboard.mode; // current layout mode
keyboard.destroy();
```

Function keys in a layout: `Backspace`, `Shift`, `CapsLock`, `Space`, `?123` (switch to `special`) and `ABC` (back to `default`).

## Screensaver

```typescript
const screensaver = new Screensaver({
  timeout: number,         // inactivity in ms before it shows
  videoUrl?: string,
  audioUrl?: string,
  containerId?: string,    // default: 'screensaver'
  videoId?: string,        // default: 'screensaverVideo'
  audioId?: string         // default: 'screensaverAudio'
});
screensaver.start();       // show now; next user activity dismisses it
screensaver.stop();        // hide and restart the inactivity timer
screensaver.setVolume(0.5);
screensaver.getIsActive();
screensaver.destroy();
```

## TransparentVideoOverlay

```typescript
const overlay = new TransparentVideoOverlay(videoElementId: string, {
  fadeTransitionDuration?: number,   // ms, default: 500
  loop?: boolean,                    // default: true
  initialSource?: string
});
overlay.showOverlay();
overlay.hideOverlay();
overlay.toggleOverlay();
overlay.changeVideoSource(getOptimalVideoSource('clip.mov', 'clip.webm'));
overlay.destroy();
```

## LoaderManager

```typescript
import { loaderManager } from 'move.gl';

const loader = loaderManager.create('spinner', { container: '#app', color: '#09f', size: 32 });
loaderManager.destroy(loader);

loaderManager.showIn('dots-bounce', '#save-button'); // swaps the content for a loader
loaderManager.hideIn('#save-button');                // restores the original content

loaderManager.register({ id: 'my-loader', css: '.loader { ... }' });
```

Built-in loaders: `spinner`, `spinner-dual`, `dots-bounce`, `dots-flash`, `progress-bar`, `progress-fill`, `pulse`, `square-flip`, `skeleton-card`, `bars-wave`.

## Browser Support


- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+
- iOS Safari 14+
- Chrome for Android 88+
