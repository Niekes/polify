# Amount counts polygons for every shape

The amount is the number of polygons the artwork is divided into, whatever its shape. Before, it only held for cells: triangles came out at about twice the amount, and hexagons followed a radius curve that stopped changing at 1000 while the slider went on to 1500. Every shape now derives its layout from the amount so the polygon count lands near it, and the slider runs to 3000. Links shared before this change still open, but triangles and hexagons render with a different number of polygons than they did; the default amount moved from 100 to 200 so the default artwork keeps its look.

## Considered Options

- Keep the amount as a loose fineness that differs per shape and only stretch the hexagon curve: rejected, the amount would keep meaning a different count for each shape.
- Put a version in the link and keep the old layout for older links: rejected, polify would carry two layouts forever for links that only change in polygon count.
