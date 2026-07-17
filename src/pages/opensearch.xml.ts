import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = site?.origin ?? 'https://samui-samui.de';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>Samui? Samui!</ShortName>
  <Description>Suche auf Samui? Samui!</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <OutputEncoding>UTF-8</OutputEncoding>
  <Url type="text/html" method="get" template="${base}/suche/?q={searchTerms}" />
  <Url type="application/opensearchdescription+xml" rel="self" template="${base}/opensearch.xml" />
  <Image height="32" width="32" type="image/x-icon">${base}/images/favicon/favicon.ico</Image>
</OpenSearchDescription>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/opensearchdescription+xml' },
  });
};
