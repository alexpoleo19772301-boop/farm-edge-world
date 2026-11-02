# Credits — Ферма на краю света

## Audio (v1.7.0)

All game audio under `www/assets/audio/*.ogg` was **originally synthesized** for this project
(Python + NumPy procedural tones/noise, encoded with ffmpeg/libvorbis).

**License:** CC0 1.0 Universal (Public Domain Dedication) — original work, no third-party samples.

Files:
- Music: `music_day.ogg`, `music_night.ogg`
- Ambient: `amb_birds.ogg`, `amb_crickets.ogg`, `amb_rain.ogg`, `amb_storm.ogg`
- SFX: `sfx_tap`, `sfx_plant`, `sfx_water`, `sfx_harvest`, `sfx_coin`, `sfx_purchase`,
  `sfx_levelup`, `sfx_unlock`, `sfx_notify`, `sfx_squish`, `sfx_moo`, `sfx_cluck`, `sfx_baa`

Generator script: `scripts/gen_audio.py` (reproducible).

## Art

Original bitmap sprites created for this game (not copied from Farm Frenzy or other titles).
Farm Frenzy was used only as a style reference per user request.

## Engine

- Capacitor / Android WebView
- HTML5 Canvas + Web Audio API
