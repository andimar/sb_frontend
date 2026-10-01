# Trial vector logo assets

The backend selector at Appearance → Customize → Identità visiva → Versione del
logo supports Classica, Vettoriale and Vettoriale con aureola. Classic remains the
default. Each vector variant provides coordinated header, footer and site icons.

The halo variant uses a thin warm gold ellipse around the upper head. Its white
versions use white lettering, a grayscale portrait preserving the original
shading, and a white halo. This treatment also applies to the vector variant
without a halo. The canvas includes extra space above the crown so
the halo is not clipped, including in PNG and ICO exports.

- `logo_vector_halo.svg` and `logo_vector_halo_white.svg`: compact colour/white logos.
- `logo_extended_vector_halo.svg` and `logo_extended_vector_halo_white.svg`: extended colour/white logos.
- `saint-head-halo.svg` and `saint-head-halo-white.svg`: isolated heads.
- `favicon-vector-halo.svg` and `favicon-vector-halo.ico`: browser favicons.
- `saint-icon-halo-{16,32,48,180,192,512}.png`: transparent compatibility and touch icons.

- `src/assets/saint-head.svg`: square transparent canvas, head isolated from
  `logo_new.svg` using a silhouette clip, with the original coloured paths intact.
- `src/assets/saint-head-white.svg`: grayscale head for dark surfaces.
- `src/assets/favicon-vector.svg`: the same head for browsers supporting SVG icons.
- `src/assets/favicon-vector.ico`: PNG-backed 16, 32 and 48 pixel ICO frames.
- `src/assets/saint-icon-{16,32,48,180,192,512}.png`: transparent raster exports
  for favicon compatibility, touch icons and WordPress site-icon testing.
- `src/assets/logo_extended_vector.svg`: original vector portrait alongside the
  outlined lettering from `tema/img/logo_extended.svg`; no embedded raster image
  and no font dependency. The active legacy asset is not overwritten.
- `src/assets/logo_extended_vector_white.svg`: white lettering and grayscale portrait for
  use where an extended horizontal logo is appropriate.
- `src/assets/logo_vector_white.svg`: compact white lettering and grayscale portrait for the
  footer, preserving the more readable 382×138 proportion at small sizes.

Regenerate from the repository root with:

```sh
node frontend/tools/create-vector-logo.cjs /path/to/sharp
```

The generator requires Sharp (a development tool, not a frontend dependency).
It checks source path counts so changes in the input artwork require review.
`gulp assets` copies these assets into `dist/assets`, as with other site assets.
The detailed portrait naturally loses fine detail at 16 pixels; review it at
actual size before choosing it as the active favicon.
