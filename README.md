<p align="center">
    <img src="https://raw.githubusercontent.com/stylescape/brand/master/src/logo/logo-transparant.png" width="20%" alt="Stylescape Logo">
</p>
<h1 align="center" style='border-bottom: none;'>move.gl</h1>
<h3 align="center">Motion & Animation Library for Web</h3>

<br/>

<div align="center">

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fwww.move.gl&up_message=Up&up_color=%23000000&down_message=Down&down_color=%23000000&style=flat-square&logo=Firefox&logoColor=FFFFFF&label=Website&labelColor=%23000000&color=%23000000)
](https://www.move.gl)
[![NPM Version](https://img.shields.io/npm/v/move.gl?style=flat-square&logo=npm&logoColor=FFFFFF&label=NPM&labelColor=%23000000&color=%23000000&link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fmove.gl)](https://www.npmjs.com/package/move.gl)
[![devContainer](https://img.shields.io/badge/devContainer-23354351?style=flat-square&logo=Docker&logoColor=%23FFFFFF&labelColor=%23000000&color=%23000000)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/stylescape/move.gl)
[![StackBlitz](https://img.shields.io/badge/StackBlitz-23354351?style=flat-square&logo=StackBlitz&logoColor=%23FFFFFF&labelColor=%23000000&color=%23000000)](https://stackblitz.com/github/stylescape/move.gl/tree/main?file=src%2Findex.html)
[![GitHub License](https://img.shields.io/github/license/stylescape/move.gl?style=flat-square&logo=readthedocs&logoColor=FFFFFF&label=&labelColor=%23000000&color=%23000000&link=LICENSE)](https://github.com/stylescape/move.gl/blob/main/LICENSE)

</div>

<div align="center">

[![Report a Bug](https://img.shields.io/badge/Report%20a%20Bug-GitHub?style=flat-square&&logoColor=%23FFFFFF&color=%23D2D9DF)](https://github.com/stylescape/move.gl/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&projects=&template=bug_report.yml)
[![Request a Feature](https://img.shields.io/badge/Request%20a%20Feature-GitHub?style=flat-square&&logoColor=%23FFFFFF&color=%23D2D9DF)](https://github.com/stylescape/move.gl/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&projects=&template=feature_request.yml)
[![Ask a Question](https://img.shields.io/badge/Ask%20a%20Question-GitHub?style=flat-square&&logoColor=%23FFFFFF&color=%23D2D9DF)](https://github.com/stylescape/move.gl/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&projects=&template=question.yml)
[![Make a Suggestion](https://img.shields.io/badge/Make%20a%20Suggestion-GitHub?style=flat-square&&logoColor=%23FFFFFF&color=%23D2D9DF)](https://github.com/stylescape/move.gl/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&projects=&template=suggestion.yml)
[![Start a Discussion](https://img.shields.io/badge/Start%20a%20Discussion-GitHub?style=flat-square&&logoColor=%23FFFFFF&color=%23D2D9DF)](https://github.com/stylescape/move.gl/issues/new?assignees=&labels=Needs%3A+Triage+%3Amag%3A%2Ctype%3Abug-suspected&projects=&template=discussion.yml)

</div>

---

## Overview

**move.gl** is a comprehensive motion and animation library designed to bring life to your web applications. It provides both SCSS mixins for CSS-based animations and TypeScript classes for interactive JavaScript-driven animations.

## Features

### SCSS Mixins

- **Animation Mixins**: Bounce, fade, slide, zoom, flip, rotate, pulse, and more
- **Transform Mixins**: Scale, rotate, translate, skew, perspective, matrix operations
- **Transition Mixins**: Smooth property transitions with customizable timing
- **Effect Mixins**: Shadows, opacity, filters (blur, brightness, contrast, etc.)
- **Mouse Interactions**: Hover effects, cursor styles, scroll behaviors
- **Loaders**: Spinners, progress indicators, and loading animations
- **Accessibility**: Animation classes settle at their end state under `prefers-reduced-motion: reduce` (opt out with `$animate_respect_reduced_motion: false`)

### TypeScript Components

- **Draggable**: Make any element draggable with mouse/touch support
- **Gesture**: Touch gesture handling (tap, swipe, pinch, rotate)
- **Keyboard**: Virtual keyboard with multiple layout support
- **Screensaver**: Inactivity-triggered screensaver with video/audio
- **VideoOverlay**: Transparent video overlay with fade effects

## Installation

```bash
npm install move.gl
```

Prebuilt CSS: `move.gl/css/move.gl.css` (or `move.gl.min.css`). It contains only move.gl's own classes and keyframes — no global reset or utility classes.

## Quick Start

### Using SCSS Mixins

Load it through Sass's Node package importer (`--pkg-importer=node`):

```scss
@use 'pkg:move.gl' as move;

.my-element {
    @include move.animate-bounce;
}

.fade-in {
    @include move.animate-fade-in($duration: 0.5s, $timing_function: ease-in-out);
}

.hover-scale {
    @include move.hover-scale(1.1);
}
```

### Using TypeScript Components

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

## Documentation

The full references live on [www.move.gl](https://www.move.gl/):

- [Sass reference](https://www.move.gl/guides/scss/): animation, transform and effect mixins, and the `$name` parameter for `@keyframes`.
- [TypeScript reference](https://www.move.gl/guides/typescript/): `Draggable`, `TouchGestureHandler`, `AdvancedGestureRecognition`, `VirtualKeyboard`, `Screensaver`, `TransparentVideoOverlay` and `LoaderManager`.
- [Live demo](https://www.move.gl/demo/): every animation class, loader and interactive component.

## Browser Support

- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+
- iOS Safari 14+
- Chrome for Android 88+

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type-check, lint and test
npm run typecheck
npm run lint
npm test

# Build for production (CSS, JS, type declarations and dist/package.json)
npm run build
```

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
    <b>Made by <a href="https://www.scape.press" target="_blank">Scape Press</a></b>
</p>
