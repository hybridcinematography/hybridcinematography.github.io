# Hybrid Cinematography project website

A static project page for **Hybrid Cinematography: Previsualizing and Managing Hallucination Risk in Generative Video Reshooting**, with seven interactive scenes and 18 video examples. No build, dependencies, or server-side code are required.

## Preview and verify

From this folder:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765/. The scene viewer also supports opening `index.html` directly from disk.

```sh
python3 assets/verify.py --inspection
node --check assets/viewer.js
```

The existing supplement verifier checks links, anchors, video inventory, seven scene payload checksums, and viewer controls. Its entrypoint names have been updated for the website. Inspection tests mock WebGL and do not replace browser checks. The renderer, compressed scene payloads, and MP4 files are unchanged.

## GitHub Pages

The intended project URL is `https://hybridcinematography.github.io/`, served from the `hybridcinematography/hybridcinematography.github.io` repository.

Publish this folder's contents at the repository root, with Pages configured to deploy from the `main` branch and `/ (root)`. The lowercase `index.html` is the entrypoint; `.nojekyll` bypasses Jekyll. Use Git to upload: the largest scene exceeds GitHub's browser upload size limit. No Git LFS is needed for these files.

## Content

The homepage contains the paper's title, authors, abstract, and workflow figure. Scene data are loaded only when a scene is opened. The videos retain the resolution of the supplemental materials. Diagnostic overlays describe support in an estimated 3D proxy; they do not guarantee the quality of a generated reshoot.
