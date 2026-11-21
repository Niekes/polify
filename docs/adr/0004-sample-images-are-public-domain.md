# Sample images are public domain

The sample images ship inside the MIT-licensed repository and are copied by every fork, so we only accept images in the public domain or under CC0 (for example paintings and prints whose artists died more than 70 years ago, taken from Wikimedia Commons). They need no attribution and can be redistributed with the code without exceptions. `public/samples/SOURCES.md` records each image's creator, collection, source URL and licence, so its origin can be checked later.

## Considered Options

- Unsplash or Pexels licence: rejected. The images are free to use, but these licences are not open: they can't be sublicensed under MIT, and they restrict building a similar service, which would surprise anyone who forks the repo.
- CC BY: rejected. Every image would need visible attribution in the app.

## Consequences

Renaming the sample images changed their names, so a link made before the change no longer finds its image and opens on the first sample image instead, like any name the link does not know.
