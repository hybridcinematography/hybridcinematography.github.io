# Hybrid Cinematography project website

A static project page for **Hybrid Cinematography: Previsualizing and Managing Hallucination Risk in Generative Video Reshooting**, with an illustrative three-factor explainer, an on-set walkthrough, and 19 video examples. No build, dependencies, or server-side code are required.

## Preview and verify

From this folder:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765/.

```sh
python3 assets/verify.py
```

The verifier checks links, anchors, video inventory, thumbnail playback attributes, and the absence of private scene-viewer assets. Browser rendering and playback are checked separately.

## GitHub Pages

The intended project URL is `https://hybridcinematography.github.io/`, served from the `hybridcinematography/hybridcinematography.github.io` repository.

Publish this folder's contents at the repository root, with Pages configured to deploy from the `main` branch and `/ (root)`. The lowercase `index.html` is the entrypoint; `.nojekyll` bypasses Jekyll.

## Content

The homepage contains the paper's title, authors, abstract, workflow figure, three rendered, looping geometric animations, and video demonstrations. The full interactive scene viewer, its reconstruction payloads, and the former slider-driven animation code are not part of the current site.
