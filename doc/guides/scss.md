# Sass Reference

The most common mixins; every class in `move.gl.css` is generated from a mixin of the same name.


## Animation Mixins

| Mixin                  | Description                     |
| ---------------------- | ------------------------------- |
| `animate-bounce`       | Bouncing animation              |
| `animate-fade-in/out`  | Fade in/out animations          |
| `animate-slide-in-up/down/left/right` | Slide in from a direction |
| `animate-slide-out-up/down/left/right` | Slide out to a direction |
| `animate-zoom-in/out`  | Zoom in/out effects             |
| `animate-pulse`        | Pulsing animation               |
| `animate-shake`        | Shake animation                 |
| `animate-flip`         | 3D flip animation               |
| `animate-rotate`       | Rotation animation              |

## Transform Mixins

| Mixin                    | Description           |
| ------------------------ | --------------------- |
| `scale($factor)`         | Scale transform       |
| `transform-rotate($angle)` | Rotation transform  |
| `translate($x, $y)`      | Translation transform |
| `skew($x, $y)`           | Skew transform        |
| `perspective($distance)` | 3D perspective        |

## Effect Mixins

| Mixin                 | Description              |
| --------------------- | ------------------------ |
| `box-shadow($x, $y, $blur, $spread, $color)` | Box shadow |
| `opacity-hover($default, $hover)` | Opacity change on hover |
| `filter-blur($radius)` | Blur filter             |
| `filter-brightness($amount)` | Brightness filter |
| `filter-contrast($amount)` | Contrast filter     |
| `filter-grayscale($amount)` | Grayscale filter   |

Mixin names use underscores in the source (`animate_fade_in`); Sass treats `-` and `_` as the same, so either spelling works.
