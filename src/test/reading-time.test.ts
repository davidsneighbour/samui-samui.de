import { describe, expect, it } from 'vitest';
import { estimateReadingTime } from '../utils/reading-time';

describe('reading time', () => {
  it('rounds the full text up at 200 words per minute', () => {
    expect(estimateReadingTime(`<p>${'Wort '.repeat(201)}</p>`).minutes).toBe(
      2,
    );
    expect(estimateReadingTime('<p>Kurz.</p>').minutes).toBe(1);
  });
  it('counts visible text and decodes entities, excluding URLs and code', () => {
    expect(
      estimateReadingTime(
        `<p>${'&uuml;ber '.repeat(200)}<img alt="ignored" src="photo.jpg"></p><script>ignored</script><pre>ignored</pre>`,
      ).minutes,
    ).toBe(1);
  });
  it('separates video from prose and excludes player fallback text', () => {
    expect(
      estimateReadingTime(
        '<dnb-youtube videoid="abc">Watch video</dnb-youtube>',
      ),
    ).toEqual({ hasVideo: true, minutes: 0 });
    expect(
      estimateReadingTime(
        '<p>Ein Text.</p><dnb-vimeo videoid="123"></dnb-vimeo>',
      ),
    ).toEqual({ hasVideo: true, minutes: 1 });
  });
  it('recognises native and legacy video without mistaking other frames for video', () => {
    expect(estimateReadingTime('<video></video>').hasVideo).toBe(true);
    expect(
      estimateReadingTime(
        '<iframe src="https://www.youtube-nocookie.com/embed/abc"></iframe>',
      ).hasVideo,
    ).toBe(true);
    expect(estimateReadingTime('<iframe src="/map"></iframe>').hasVideo).toBe(
      false,
    );
    expect(estimateReadingTime('<img src="photo.jpg">')).toEqual({
      hasVideo: false,
      minutes: 0,
    });
  });
});
