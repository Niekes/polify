# No server: the export is made in the browser

Polify used to send its exports by email: a PHP endpoint with PHPMailer received the SVG, rendered a PNG and mailed both, and kept the files on the server. We drop the server completely. The SVG and the PNG are made in the browser and saved directly, and Polify is hosted as static files on GitHub Pages.

## Considered Options

- Keep the email delivery: rejected. It collected email addresses, kept user images on a server, needed SMTP credentials and a PHP host, and only existed to make the user's address available to the author.

## Consequences

Polify has no way to contact its users and stores nothing about them, so there is no cookie banner and no analytics. A PNG export is rasterised from the SVG in the browser, which caps its size at what the browser can allocate for a canvas.
