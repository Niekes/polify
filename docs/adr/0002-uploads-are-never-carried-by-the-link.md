# Uploads are never carried by the link

The link carries the complete artwork, compressed into the address, so sharing needs no server (see ADR-0001). A sample image is referenced by name and a gradient by its ramp, type and angle, so both reopen exactly. An upload is too large for an address and storing it anywhere would need a server, so the link of an artwork made from an upload carries every setting and the fact that it came from an upload, but not the image. Within the page that made it, undo and redo keep showing the upload; opened anywhere else, the link shows those settings on the first sample image.

## Considered Options

- Downscale the upload into the link: rejected, even a small thumbnail outgrows practical address lengths and would sample different colors than the original.
- Upload the image to a store and put its id in the link: rejected, it brings back the server ADR-0001 removed.
