import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ArrowLeft, ArrowRight, Check, Link2, Search } from 'lucide-react';
import { ALL_TAGS, POSTS, fmtDate, postUrl, renderMarkdown } from '../blog/posts';
import { ME, PROFILE_IMG } from '../data/portfolio';
import { useReveal } from '../core/reveal';
import { onIntroDone } from '../core/intro';
import { reducedMotion } from '../core/store';
import PageHero from '../components/PageHero';
import { ScrollArt } from '../components/HeroArt';
import Cover from '../components/Cover';
import { TLink } from '../components/Shell';
import '../styles/pages.css';
import '../styles/blog.css';

/* ------------------------------------------------------------------ index */
function BlogIndex() {
  const root = useRef(null);
  const [tag, setTag] = useState('All');
  const [q, setQ] = useState('');
  const [lead, ...rest] = POSTS;
  const filtering = tag !== 'All' || q.trim();
  const list = useMemo(
    () => POSTS.filter((p) => (tag === 'All' || p.tags.includes(tag)) && `${p.title} ${p.excerpt} ${p.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase())),
    [tag, q],
  );

  useReveal(root, () => {});

  useEffect(() => {
    if (!filtering || reducedMotion()) return;
    gsap.fromTo('.bgrid .bcard', { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.05, ease: 'expo.out' });
    ScrollTrigger.refresh();
  }, [tag, q, filtering]);

  return (
    <div className="page blog2" ref={root}>
      <PageHero ep="VOL.02 · INK LOG" jp="書 — Notes from the lab" kanji="書" title="The ink" accent="log." pose="bow"
        art={<ScrollArt posts={POSTS} />} vert="書 ── 研究室からの手紙 ── 第二巻"
        tape={['INK LOG', '書', 'MACHINE LEARNING', 'SYSTEMS', 'MOTION DESIGN', 'WHAT BROKE', 'NEW CHAPTER']}
        stats={[[POSTS.length, 'Chapters'], [POSTS.reduce((a, p) => a + p.minutes, 0), 'Minutes of reading'], [ALL_TAGS.length, 'Topics']]}>
        <p className="lead">Writing on machine learning, systems engineering and motion design: what I'm building, and what broke along the way.</p>
      </PageHero>

      <section className="paper blog-sec">
        <div className="wrap">
          <div className="btools">
            <div className="btags" role="tablist" aria-label="Filter by tag">
              {['All', ...ALL_TAGS].map((t) => (
                <button key={t} role="tab" aria-selected={tag === t} className={`btag ${tag === t ? 'is-on' : ''}`} onClick={() => setTag(t)}>{t}</button>
              ))}
            </div>
            <label className="gh-search">
              <Search size={18} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts…" aria-label="Search posts" />
            </label>
          </div>

          {!filtering && lead && (
            <TLink href={postUrl(lead.slug)} className="blead" data-cursor="READ" data-anim="tilt">
              <div className="blead-art"><Cover motif={lead.motif} seed={lead.seed} kanji={lead.kanji} /></div>
              <div className="blead-body">
                <span className="tag tag--red">Latest</span>
                <span className="mono">{fmtDate(lead.date)} · {lead.minutes} min read</span>
                <h2>{lead.title}</h2>
                <p>{lead.excerpt}</p>
                <span className="blead-go">Read the chapter <ArrowRight size={18} /></span>
              </div>
            </TLink>
          )}

          <div className="bgrid" data-anim={filtering ? undefined : 'stagger'} data-each="0.08">
            {(filtering ? list : rest).map((p) => (
              <TLink href={postUrl(p.slug)} className="bcard" key={p.slug} data-cursor="READ">
                <div className="bcard-art"><Cover motif={p.motif} seed={p.seed} kanji={p.kanji} /></div>
                <div className="bcard-body">
                  <span className="mono">{fmtDate(p.date)} · {p.minutes} min</span>
                  <h3>{p.title}</h3>
                  <p>{p.excerpt}</p>
                  <span className="wcard-tags">{p.tags.map((t) => <i key={t}>{t}</i>)}</span>
                </div>
              </TLink>
            ))}
          </div>
          {filtering && !list.length && <p className="gh-note">No posts match that. Try another tag.</p>}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ post */
function BlogPost({ post }) {
  const root = useRef(null);
  const bar = useRef(null);
  const [copied, setCopied] = useState(false);
  const [active, setActive] = useState('');
  const { html, toc } = useMemo(() => renderMarkdown(post.body), [post]);
  const idx = POSTS.findIndex((p) => p.slug === post.slug);
  const newer = POSTS[idx - 1];
  const older = POSTS[idx + 1];

  useEffect(() => {
    document.title = `${post.title} | ${ME.name}`;
  }, [post]);

  useLayoutEffect(() => {
    const el = root.current;
    let unsub = () => {};
    const ctx = gsap.context(() => {
      // reading progress
      ScrollTrigger.create({
        trigger: '.post-body', start: 'top 30%', end: 'bottom 70%',
        onUpdate: (s) => { if (bar.current) bar.current.style.transform = `scaleX(${s.progress})`; },
      });
      // active ToC entry
      toc.forEach((t) => {
        ScrollTrigger.create({ trigger: `#${CSS.escape(t.id)}`, start: 'top 40%', end: 'max', onToggle: (s) => s.isActive && setActive(t.id) });
      });
      if (reducedMotion()) return;
      const split = new SplitText('.post-title', { type: 'words,chars', charsClass: 'hc' });
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
        .from('.post-cover', { clipPath: 'polygon(0 0, 0 0, -20% 100%, -20% 100%)', duration: 1.3, ease: 'expo.inOut' }, 0)
        .from(split.chars, { yPercent: 110, rotateX: -80, opacity: 0, stagger: 0.012, duration: 1 }, 0.2)
        .from('.post-meta > *', { y: 20, autoAlpha: 0, stagger: 0.05, duration: 0.7 }, 0.4)
        .from('.post-kanji', { scale: 2, autoAlpha: 0, rotate: -20, duration: 1.2 }, 0.3);
      unsub = onIntroDone(() => tl.play());
      gsap.utils.toArray('.post-body > h2, .post-body > pre, .post-body > blockquote').forEach((b) => {
        gsap.fromTo(b, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'expo.out', clearProps: 'transform', scrollTrigger: { trigger: b, start: 'top 90%' } });
      });
    }, el);
    const t = setTimeout(() => ScrollTrigger.refresh(), 500);
    return () => { clearTimeout(t); unsub(); ctx.revert(); };
  }, [post, toc]);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };

  return (
    <article className="page post" ref={root}>
      <div className="post-progress" aria-hidden="true"><span ref={bar} /></div>
      <header className="post-head">
        <span className="post-kanji" aria-hidden="true">{post.kanji}</span>
        <div className="wrap post-head-inner">
          <TLink href="/blog2/" className="post-back"><ArrowLeft size={16} /> All posts</TLink>
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            <span className="post-author"><img src={PROFILE_IMG} alt="" />{ME.name}</span>
            <span className="mono">{fmtDate(post.date)}</span>
            <span className="mono">{post.minutes} min read</span>
            {post.tags.map((t) => <span className="tag tag--xs" key={t}>{t}</span>)}
          </div>
        </div>
        <div className="wrap"><div className="post-cover"><Cover motif={post.motif} seed={post.seed} kanji={post.kanji} /></div></div>
      </header>

      <div className="wrap post-layout">
        <aside className="post-toc">
          <span className="mono">Contents · 目次</span>
          <ol>
            {toc.map((t) => (
              <li key={t.id}><a href={`#${t.id}`} className={active === t.id ? 'is-on' : ''}>{t.text}</a></li>
            ))}
          </ol>
          <button className="btn btn--sm btn--line post-share" onClick={share}>
            {copied ? <><Check size={14} /> Copied</> : <><Link2 size={14} /> Copy link</>}
          </button>
        </aside>
        <div className="post-body" dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      <footer className="wrap post-foot">
        <div className="post-sign panel-frame">
          <img src={PROFILE_IMG} alt="" />
          <div>
            <b>Written by {ME.name}</b>
            <p>{ME.degree} at {ME.school}. Building at the line between AI and the interfaces people use.</p>
            <a href={ME.mailto} target="_blank" rel="noreferrer" className="ulink">Reply by email →</a>
          </div>
        </div>
        <nav className="post-nav">
          {older ? (
            <TLink href={postUrl(older.slug)} className="post-nav-card"><span className="mono"><ArrowLeft size={14} /> Older</span><b>{older.title}</b></TLink>
          ) : <span />}
          {newer ? (
            <TLink href={postUrl(newer.slug)} className="post-nav-card post-nav-card--next"><span className="mono">Newer <ArrowRight size={14} /></span><b>{newer.title}</b></TLink>
          ) : <span />}
        </nav>
      </footer>
    </article>
  );
}

export default function Blog2() {
  const slug = new URLSearchParams(window.location.search).get('post');
  const post = slug && POSTS.find((p) => p.slug === slug);
  if (slug && !post) {
    return (
      <div className="page blog-missing wrap">
        <span className="sfx">？！</span>
        <h1 className="h-xl">That chapter doesn't exist.</h1>
        <TLink href="/blog2/" className="btn btn--red">Back to all posts</TLink>
      </div>
    );
  }
  return post ? <BlogPost post={post} /> : <BlogIndex />;
}
