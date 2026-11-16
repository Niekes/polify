# Polify

Generator for low poly artworks: a source is divided into polygons, each polygon takes the color of the source beneath it, and the result is exported as SVG or PNG.

## Language

### Source

**Source**:
What the polygons take their colors from: either an image or a gradient. An artwork has exactly one source.
_Avoid_: Reference image, Input, Background

**Image**:
A source made from a picture, either chosen from the gallery or uploaded.
_Avoid_: Photo, Picture, Reference image

**Gradient**:
A source made from color stops that blend into each other.
_Avoid_: Color ramp, Fade

**Ramp**:
The named sequence of colors a gradient blends through, chosen from a fixed list.
_Avoid_: Palette, Color scheme, Interpolator

**Gradient type**:
Whether a gradient runs along a straight line at an angle (linear) or outward from the center (radial).
_Avoid_: Gradient mode, Direction

**Gallery**:
The collection of images that ship with Polify and can be chosen as a source.
_Avoid_: Defaults, Presets, Library

**Upload**:
An image the user brings from their own device. It never leaves the browser and is not carried by the link.
_Avoid_: Custom image, File

**Rotation**:
Turning an image by a quarter turn. A gradient turns by its angle instead.
_Avoid_: Orientation, Flip

### Composition

**Surface**:
The area the artwork is drawn on. Its aspect ratio follows the image, or is chosen for a gradient.
_Avoid_: Canvas, Stage, Viewport

**Artwork**:
The source divided into polygons and colored, with all adjustments applied. It is exported and shared as a link.
_Avoid_: Picture, Result, Output, Wallpaper

**Shape**:
The kind of polygon an artwork is made of: triangle, cell or hexagon.
_Avoid_: Mode, Pattern, Style

**Polygon**:
One tile of the artwork. Its color is the color of the source at its center.
_Avoid_: Tile, Cell (when meaning any tile), Particle

**Amount**:
How many polygons the artwork is divided into, whatever its shape.
_Avoid_: Size, Density, Count, Resolution

**Vibration**:
How far the corners of triangles and cells stray from an even grid. Hexagons have none.
_Avoid_: Jitter, Noise, Randomness

**Seed**:
The number that fixes where vibration moves the corners, so the same link always gives the same artwork. Randomize picks a new one.
_Avoid_: Random state, Shuffle

### Color

**Adjustment**:
A change applied to every polygon's color after it is taken from the source: hue, saturation, lightness, contrast, invert, threshold, grayscale, fill opacity and stroke opacity.
_Avoid_: Filter, Effect

**Threshold**:
The adjustment that turns every polygon either black or white, depending on its brightness.
_Avoid_: Binarize, Black & white

### Interaction

**Agent**:
A program that reads and replaces the artwork on request, instead of someone moving the sliders.
_Avoid_: Bot, Assistant

### Sharing

**Link**:
The address that carries a complete artwork: shape, amount, vibration, seed, adjustments and the source. It is the only storage of a shared artwork. An upload is never part of it.
_Avoid_: URL, Permalink, Share link

**Export**:
The file made from an artwork, either SVG or PNG, created in the browser. An SVG export carries the artwork's link so it can reopen it.
_Avoid_: Download, Send, Save
