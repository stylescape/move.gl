#!/usr/bin/env python3
content = """// ============================================================================
// move.gl | Loaders Mixin Index
// ============================================================================
// Copyright 2025 Scape Agency BV
// Licensed under MIT License
// ============================================================================

////
/// Loaders Mixin Module
/// ===========================================================================
///
/// This module provides loading animation mixins for spinners and progress.
///
/// @group Loaders
/// @author Scape Agency
/// @link https://move.gl
/// @since 0.1.0 initial release
/// @access public
////


// ============================================================================
// Variables (centralized to avoid conflicts)
// ============================================================================

$loader-size: 48px !default;
$loader-color: #FFF !default;
$loader-accent: #FF3D00 !default;
$loader-speed: 1s !default;


// ============================================================================
// Base loader mixin
// ============================================================================

@forward "base";


// ============================================================================
// Legacy loaders
// ============================================================================

@forward "spinner" hide $loader-size, $loader-color, $loader-accent, $loader-speed;
@forward "progress" hide $loader-size, $loader-color, $loader-accent, $loader-speed;


// ============================================================================
// Animation-based loaders
// ============================================================================

@forward "dots" hide $loader-size, $loader-color, $loader-accent, $loader-speed;
@forward "bars" hide $loader-size, $loader-color, $loader-accent, $loader-speed;
@forward "rings" hide $loader-size, $loader-color, $loader-accent, $loader-speed;
@forward "special" hide $loader-size, $loader-color, $loader-accent, $loader-speed;


// ============================================================================
// Shape-based loaders
// ============================================================================

@forward "bubble" hide $loader-size, $loader-color, $loader-accent, $loader-speed;
@forward "circle" hide $loader-size, $loader-color, $loader-accent, $loader-speed;
@forward "rect" hide $loader-size, $loader-color, $loader-accent, $loader-speed;
@forward "line" hide $loader-size, $loader-color, $loader-accent, $loader-speed;


// ============================================================================
// Content loaders
// ============================================================================

@forward "text" hide $loader-size, $loader-color, $loader-accent, $loader-speed;
@forward "skeleton" hide $loader-size, $loader-color, $loader-accent, $loader-speed, $skeleton-bg, $skeleton-highlight;


// ============================================================================
// Graphic loaders
// ============================================================================

@forward "graph" hide $loader-size, $loader-color, $loader-accent, $loader-speed;
@forward "objects" hide $loader-size, $loader-color, $loader-accent, $loader-speed;
"""

with open(
    "/Users/larsvanvianen/Documents/GitHub/stylescape/move.gl/src/scss/mixins/loaders/_index.scss",
    "w",
) as f:
    f.write(content)
print("File written successfully!")
