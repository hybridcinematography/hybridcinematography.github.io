"""Verify the public project page, links, and video examples without dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.links = []
        self.videos = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'video':
            self.videos.append(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f"Duplicate id: {attrs['id']}"
            self.ids.add(attrs['id'])
        for key in ('src', 'href', 'poster', 'data-src'):
            if key in attrs:
                self.links.append((tag, key, attrs[key]))


def main():
    assert {'index.html', 'README.md', 'assets'} <= {p.name for p in ROOT.iterdir()}, 'Missing site entrypoint or assets'
    assert not (ROOT / 'assets/scenes').exists(), 'Interactive scene payloads must remain private'
    for name in ('viewer.js', 'viewer.css', 'manifest.json', 'risk-explainer.js'):
        assert not (ROOT / 'assets' / name).exists(), f'Private viewer asset is present: {name}'
    pages = [ROOT / 'index.html', *sorted((ROOT / 'assets/videos').glob('*.html'))]
    for path in pages:
        text = path.read_text()
        page = Page()
        page.feed(text)
        for tag, attribute, link in page.links:
            url = urlsplit(link)
            if tag == 'a' and attribute == 'href' and url.scheme == 'https' and url.netloc:
                continue  # Public author homepages; assets must still be local.
            if tag == 'iframe' and attribute == 'src' and link == 'https://www.youtube-nocookie.com/embed/Y9uDFzBZXWE':
                continue  # The project video supplied by the authors.
            assert not url.scheme and not url.netloc, f'External dependency: {link}'
            target = (path.parent / unquote(url.path)).resolve() if url.path else path
            assert target.is_relative_to(ROOT) and target.is_file(), f'Missing asset: {link}'
            if url.fragment:
                other = Page()
                other.feed(target.read_text())
                assert url.fragment in other.ids, f'Missing anchor: {link}'
        if path.name == 'index.html':
            assert 'scenes' not in page.ids and 'guide' not in page.ids
            expected = {f'assets/previews/video-{p.stem}.mp4' for p in (ROOT / 'assets/videos').glob('*.html')}
            previews = [v for v in page.videos if 'data-src' in v]
            assert {urlsplit(v['data-src']).path for v in previews} == expected
            assert len(previews) == len(expected), 'Each card needs one preview'
            assert text.count('class="comparison-labels"') == len(expected), 'Each example needs input/output labels'
            for video in previews:
                assert {'muted', 'loop', 'playsinline'} <= video.keys()
                assert 'src' not in video and 'autoplay' not in video and video.get('preload') == 'none'
                assert video.get('aria-hidden') == 'true' and video.get('tabindex') == '-1'
                assert (ROOT / urlsplit(video['data-src']).path).stat().st_size < 1_500_000, 'Preview exceeds 1.5 MB budget'
            print(f'PASS: {len(previews)} silent, lazy-loaded thumbnail videos; each under 1.5 MB.')
            assert not {'risk-interactive', 'risk-amount', 'risk-plan', 'risk-recorded', 'risk-requested'} & page.ids, 'Replaced interactive diagrams must not remain'
            factors = [v for v in page.videos if v.get('src', '').startswith('assets/factor-videos/')]
            assert {v.get('src') for v in factors} == {
                f'assets/factor-videos/{name}.mp4' for name in ('coverage', 'resolution', 'performance')
            } and len(factors) == 3, 'Expected three rendered factor animations'
            for video in factors:
                assert {'controls', 'muted', 'loop', 'playsinline', 'poster', 'aria-label'} <= video.keys()
                assert video.get('preload') == 'none' and 'autoplay' not in video
                assert (ROOT / video['src']).read_bytes()[4:8] == b'ftyp'
            print('PASS: 3 rendered factor videos with silent loops, posters, and playback controls; interactive animation code removed.')
            visualizer_previews = [v for v in page.videos if v.get('src', '').startswith('assets/visualizer-previews/')]
            assert {v.get('src') for v in visualizer_previews} == {
                f'assets/visualizer-previews/{name}.mp4' for name in ('office-performer', 'hall-cartwheel')
            } and len(visualizer_previews) == 2, 'Expected two recorded visualizer previews'
            for video in visualizer_previews:
                assert {'muted', 'loop', 'playsinline', 'poster', 'aria-label'} <= video.keys()
                assert 'controls' not in video, 'Visualizer teasers should show recorded views without controls'
                assert video.get('preload') == 'none' and 'autoplay' not in video
                clip = ROOT / video['src']
                assert clip.read_bytes()[4:8] == b'ftyp'
                assert clip.stat().st_size < 1_500_000, 'Visualizer preview exceeds 1.5 MB budget'
            assert {p.name for p in (ROOT / 'assets/visualizer-previews').iterdir()} == {
                f'{name}.{ext}' for name in ('office-performer', 'hall-cartwheel') for ext in ('mp4', 'jpg')
            }, 'Visualizer preview folder must contain only the videos and posters'
            print('PASS: 2 lightweight, recorded visualizer previews; only MP4 videos and JPEG posters.')
            demo = [v for v in page.videos if v.get('src', '').startswith('assets/drone-demo/')]
            assert {v.get('src') for v in demo} == {
                f'assets/drone-demo/{name}.mp4'
                for name in ('walkthrough', 'capture', 'condition', 'gen3c', 'gemini')
            } and len(demo) == 5, 'Drone demo must include its walkthrough, input, condition, and both outputs'
            for video in demo:
                assert {'controls', 'playsinline', 'poster', 'aria-label'} <= video.keys()
                assert video.get('preload') == 'none' and 'autoplay' not in video
                assert (ROOT / video['src']).read_bytes()[4:8] == b'ftyp'
            print('PASS: 5 labeled drone-demo clips with posters, manual playback, and no eager video loading.')
        if path.parent.name == 'videos':
            expected = set((ROOT / 'VIDEO_EXAMPLES' / path.stem).glob('*.mp4'))
            actual = {(path.parent / unquote(v['src'])).resolve() for v in page.videos}
            assert expected and actual == expected, f'Video inventory mismatch: {path}'
            assert len(page.videos) == len(expected), f'Duplicate videos: {path}'
            assert all('controls' in v and 'autoplay' not in v for v in page.videos)
    video_folders = {p.name for p in (ROOT / 'VIDEO_EXAMPLES').iterdir()
                     if p.is_dir() and any(p.glob('*.mp4'))}
    assert {p.stem for p in (ROOT / 'assets/videos').glob('*.html')} == video_folders
    total = sum(p.stat().st_size for p in ROOT.rglob('*') if p.is_file() and '.git' not in p.relative_to(ROOT).parts)
    print(f'PASS: {len(pages)} HTML pages; local assets and anchors verified; outbound HTTPS links allowed; {len(video_folders)} video examples. Package: {total / 1048576:.2f} MiB.')
    print('This checks package integrity; it does not test browser rendering or playback.')


if __name__ == '__main__':
    main()
