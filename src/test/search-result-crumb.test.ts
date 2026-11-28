import { describe, expect, it } from 'vitest';
import { searchResultCrumb } from '../utils/search-result-crumb';

describe('searchResultCrumb', () => {
  it.each([
    ['/2006/02/derchef/', ['Blog', '2006', 'Februar']],
    ['/2026/nicht-jeder-pass-oeffnet-dieselben-tueren/', ['Blog', '2026']],
    ['/ueber-mich/', ['Über mich']],
    ['/digitale-archaeologie/', ['Digitale Archäologie']],
    ['/archiv/', ['Archiv']],
    ['/archiv/2006/', ['Archiv', '2006']],
    ['/archiv/themen/politik/', ['Archiv', 'Themen']],
    ['/archiv/relikte/', ['Archiv', 'Relikte']],
    ['/kleingedrucktes/impressum/', ['Kleingedrucktes']],
    ['/', ['Startseite']],
    ['/irgendwas/', ['Seite']],
    [
      'https://samui-samui.de/2005/12/letzte-tage/#top',
      ['Blog', '2005', 'Dezember'],
    ],
  ])('%s', (url, expected) => {
    expect(searchResultCrumb(url)).toEqual(expected);
  });
});
