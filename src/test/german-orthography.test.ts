import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const vale = path.resolve('node_modules/.bin/vale');

interface ValeAlert {
  Check: string;
  Match: string;
  Message: string;
}

/** Lint Markdown through the repository's .vale.ini and SamuiDE style. */
function lint(markdown: string, ...args: string[]): ValeAlert[] {
  // Vale exits with 1 when it reports errors, so read stdout either way.
  const { status, stdout, stderr } = spawnSync(
    vale,
    ['--ext=.md', '--output=JSON', ...args],
    { encoding: 'utf8', input: markdown },
  );
  if (status !== 0 && status !== 1) throw new Error(`Vale failed: ${stderr}`);
  const result = JSON.parse(stdout) as Record<string, ValeAlert[]>;
  return result['stdin.md'] ?? [];
}

const suggestions = (alerts: ValeAlert[]) =>
  alerts.map(({ Check, Match, Message }) => ({
    check: Check,
    match: Match,
    suggestion: Message.match(/'([^']+)'/)?.[1],
  }));

describe('SamuiDE house orthography', () => {
  it('accepts reformed ß/ss with traditional loanword spellings', () => {
    expect(
      lint(
        'Ich weiß, dass er kommen muss. Der Delphin schwimmt im Fluss. ' +
          'Die Photographie zeigt das Schloss. Er arbeitet selbständig. ' +
          'Die Straße, der Fuß, viel Spaß und das Maß bleiben unverändert. ' +
          'Die Graphik hat Potential, die Phantasie ist essentiell.\n',
      ),
    ).toEqual([]);
  });

  it.each([
    ['Ich weiß, daß er kommen muß.', 'daß', 'dass'],
    ['Daß es regnet.', 'Daß', 'Dass'],
    ['Zum Schluß ein Mißverständnis.', 'Schluß', 'Schluss'],
    ['Zum Schluß ein Mißverständnis.', 'Mißverständnis', 'Missverständnis'],
    ['Er wußte es.', 'wußte', 'wusste'],
  ])('reports pre-reform ß in "%s"', (text, match, suggestion) => {
    expect(suggestions(lint(`${text}\n`))).toContainEqual({
      check: 'SamuiDE.ReformedEszett',
      match,
      suggestion,
    });
  });

  it.each([
    ['Der Delfin springt.', 'Delfin', 'Delphin'],
    ['Ein Foto vom Strand.', 'Foto', 'Photo'],
    ['Viele Fotos.', 'Fotos', 'Photos'],
    ['Fotografieren macht Spaß.', 'Fotografieren', 'Photographieren'],
    ['Er hat fotografiert.', 'fotografiert', 'photographiert'],
    ['Die Grafik ist neu.', 'Grafik', 'Graphik'],
    ['Eine Biografie.', 'Biografie', 'Biographie'],
    ['Das Potenzial ist groß.', 'Potenzial', 'Potential'],
    ['Selbstständigkeit zählt.', 'Selbstständigkeit', 'Selbständigkeit'],
    ['Viel Fantasie.', 'Fantasie', 'Phantasie'],
  ])('reports the modern variant in "%s"', (text, match, suggestion) => {
    expect(suggestions(lint(`${text}\n`))).toContainEqual({
      check: 'SamuiDE.HouseSpelling',
      match,
      suggestion,
    });
  });

  it('does not match inside longer compounds', () => {
    expect(lint('Ein Großfoto und ein Müllfoto.\n')).toEqual([]);
  });

  it('keeps proper names listed in TokenIgnores', () => {
    expect(lint('Ein Konzert der Fantastischen Vier.\n')).toEqual([]);
  });

  it('reports ß damaged into a question mark', () => {
    expect(suggestions(lint('Die gro?e Stra?e. Was? Ja.\n'))).toEqual([
      { check: 'SamuiDE.BrokenEszett', match: 'gro?e', suggestion: 'gro?e' },
      { check: 'SamuiDE.BrokenEszett', match: 'Stra?e', suggestion: 'Stra?e' },
    ]);
  });

  it('hides the strict profile unless suggestions are requested', () => {
    expect(lint('Ruf mich per Telefon an.\n')).toEqual([]);
    expect(
      suggestions(
        lint('Ruf mich per Telefon an.\n', '--minAlertLevel=suggestion'),
      ),
    ).toEqual([
      {
        check: 'SamuiDE.HouseSpellingStrict',
        match: 'Telefon',
        suggestion: 'Telephon',
      },
    ]);
  });

  it('skips code and link targets', () => {
    expect(
      lint('Siehe `Foto` und [Bild](https://example.com/Foto.jpg).\n'),
    ).toEqual([]);
  });
});
