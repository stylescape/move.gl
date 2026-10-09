# Quick Start

## Installation

```bash
npm install move.gl
```

## Prebuilt CSS

Link `move.gl/css/move.gl.css` (or `move.gl.min.css`) and use the classes:

```html
<link rel="stylesheet" href="node_modules/move.gl/css/move.gl.min.css">

<div class="animate_bounce">Bouncing</div>
<button class="hover--lift cursor--pointer">Lifts on hover</button>
```

The CSS contains only move.gl's own classes and keyframes: no global reset or utility classes.

## Sass

Load move.gl through Sass's Node package importer (`--pkg-importer=node` on the CLI, `NodePackageImporter` in the JS API):

```scss
@use "pkg:move.gl" as move;

.card {
    @include move.animate-fade-in;
    @include move.hover-lift;
}
```

Mixin names use underscores in the source (`animate_fade_in`); Sass treats `-` and `_` as the same, so either spelling works.

To turn off the reduced-motion handling:

```scss
@use "pkg:move.gl" as move with ($animate_respect_reduced_motion: false);
```

## TypeScript


```typescript
import { Draggable, TouchGestureHandler, Screensaver } from 'move.gl';

// Make an element draggable within its parent
const draggable = new Draggable('myElement', {
  onDragEnd: (x, y) => console.log(`Dropped at ${x}, ${y}`)
});

// Handle touch gestures
const gesture = new TouchGestureHandler('gestureArea', {
  onSwipe: (direction, dx, dy) => console.log(`Swiped ${direction}`),
  onPinch: (scale) => console.log(`Pinch scale: ${scale}`)
});

// Create a screensaver
const screensaver = new Screensaver({
  videoUrl: 'screensaver.mp4',
  timeout: 300000 // 5 minutes of inactivity
});
```
