// Blog posts are Markdown files with a small front-matter block, bundled at build time.
const files = import.meta.glob('./posts/*.md', { query: '?raw', import: 'default', eager: true });

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const slugify = (s) => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function inline(s) {
  // code spans first so their contents are left alone
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `@@CODE${codes.length - 1}@@`; });
  s = esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  return s.replace(/@@CODE(\d+)@@/g, (_, i) => `<code>${esc(codes[+i])}</code>`);
}

/** Minimal Markdown → HTML: headings, paragraphs, lists, quotes, fenced code, rules. */
export function renderMarkdown(src) {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  const toc = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    const fence = line.match(/^```(\w*)/);
    if (fence) {
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) buf.push(lines[i++]);
      i++;
      out.push(`<pre class="md-code" data-lang="${fence[1] || 'text'}"><code>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }

    const h = line.match(/^(#{2,4})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const html = inline(h[2]);
      const id = slugify(h[2]);
      if (level === 2) toc.push({ id, text: h[2].replace(/[*`]/g, '') });
      out.push(`<h${level} id="${id}">${html}</h${level}>`);
      i++;
      continue;
    }

    if (/^---+\s*$/.test(line)) { out.push('<hr />'); i++; continue; }

    if (line.startsWith('>')) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith('>')) buf.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote><p>${inline(buf.join(' '))}</p></blockquote>`);
      continue;
    }

    const ul = /^\s*[-*]\s+/;
    const ol = /^\s*\d+\.\s+/;
    if (ul.test(line) || ol.test(line)) {
      const ordered = ol.test(line);
      const re = ordered ? ol : ul;
      const items = [];
      while (i < lines.length && re.test(lines[i])) {
        let item = lines[i++].replace(re, '');
        // lazy continuation lines
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !ul.test(lines[i]) && !ol.test(lines[i])) item += ' ' + lines[i++].trim();
        items.push(`<li>${inline(item)}</li>`);
      }
      out.push(ordered ? `<ol>${items.join('')}</ol>` : `<ul>${items.join('')}</ul>`);
      continue;
    }

    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(```|#{2,4}\s|>|\s*[-*]\s|\s*\d+\.\s|---+\s*$)/.test(lines[i])) buf.push(lines[i++]);
    out.push(`<p>${inline(buf.join(' '))}</p>`);
  }
  return { html: out.join('\n'), toc };
}

function parse(path, raw) {
  const m = raw.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const meta = {};
  const body = m ? m[2] : raw;
  if (m) {
    m[1].split('\n').forEach((l) => {
      const k = l.indexOf(':');
      if (k > 0) meta[l.slice(0, k).trim()] = l.slice(k + 1).trim();
    });
  }
  const slug = path.split('/').pop().replace(/\.md$/, '');
  const words = body.split(/\s+/).filter(Boolean).length;
  return {
    slug,
    title: meta.title || slug,
    date: meta.date || '',
    tags: (meta.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    excerpt: meta.excerpt || '',
    motif: meta.motif || 'cells',
    kanji: meta.kanji || '書',
    minutes: Math.max(1, Math.round(words / 220)),
    body,
  };
}

export const POSTS = Object.entries(files)
  .map(([p, raw]) => parse(p, raw))
  .sort((a, b) => (a.date < b.date ? 1 : -1))
  .map((p, i) => ({ ...p, seed: 11 + i * 7 }));

export const ALL_TAGS = Array.from(new Set(POSTS.flatMap((p) => p.tags))).sort();

export const fmtDate = (d) => {
  if (!d) return '';
  const dt = new Date(`${d}T00:00:00`);
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const postUrl = (slug) => `/blog2/?post=${encodeURIComponent(slug)}`;
