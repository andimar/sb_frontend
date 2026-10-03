# Vector logo assets

Customizer choices: Classic, previous vector, new vector, and new vector with dark background.
Removed halo choices resolve to the corresponding version without a halo for compatibility.

Sources:
- Transparent and white logos: `tema/icons/img/sbernardo.svg`.
- Dark normal and extended logos: `tema/icons/img/SVG/sbernardo.svg`.
- Favicons and PWA icons: `tema/icons/img/SVG/sbernardo-semplificato.svg`, complete bust without head cropping.

Dark logos have a `#0A0D19` portrait panel with subtly rounded corners. White logos retain white lettering and a grayscale portrait without a panel. Previous vector assets live in `src/assets/legacy-vector/`.

Regenerate with `node frontend/tools/create-vector-logo.cjs /path/to/sharp`, then build with Gulp. SVG, ICO and PNG icons are generated together; PWA icons include 192/512px transparent and maskable exports. Generating assets does not enable a PWA.
