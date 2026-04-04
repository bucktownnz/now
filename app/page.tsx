'use client'

import { useState } from 'react'
import Link from 'next/link'

type Page = 'home' | 'now' | 'work' | 'writing'

export default function PortfolioPage() {
  const [activePage, setActivePage] = useState<Page>('home')

  return (
    <div style={{ background: '#0E0F0D', color: '#E8E4DC', fontFamily: "'DM Mono', monospace", fontWeight: 300, lineHeight: 1.7, minHeight: '100vh', WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300&family=DM+Mono:wght@300;400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { color: inherit; text-decoration: none; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { opacity: 0; animation: fadeUp 0.6s ease forwards; }
      `}</style>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 2rem' }}>

        {/* Nav */}
        <nav style={{ paddingTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="fade-up">
          <button onClick={() => setActivePage('home')} style={{ fontFamily: 'Fraunces, serif', fontSize: '1rem', fontWeight: 400, color: '#C8A96E', background: 'none', border: 'none', cursor: 'pointer' }}>
            Sam Buxton
          </button>
          <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none' }}>
            {(['now', 'work', 'writing'] as Page[]).map((p) => (
              <li key={p}>
                <button
                  onClick={() => setActivePage(p)}
                  style={{ color: activePage === p ? '#C8A96E' : '#7A7870', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'color 0.2s' }}
                >
                  {p}
                </button>
              </li>
            ))}
            <li>
              <Link
                href="/dashboard"
                style={{ color: '#7A7870', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                Watchlist
              </Link>
            </li>
          </ul>
        </nav>

        {/* HOME */}
        {activePage === 'home' && (
          <>
            <div className="fade-up" style={{ padding: '7rem 0 5rem', animationDelay: '0.25s' }}>
              <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7870', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ display: 'inline-block', width: '2rem', height: '1px', background: '#8A7249' }} />
                Product Manager &amp; Builder
              </div>
              <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(2.8rem, 7vw, 4.2rem)', fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#E8E4DC', marginBottom: '2rem' }}>
                Building things that <em style={{ fontStyle: 'italic', color: '#C8A96E' }}>actually matter.</em>
              </h1>
              <div style={{ fontSize: '0.95rem', color: '#7A7870', maxWidth: 520, lineHeight: 1.85 }}>
                <p>I&apos;m Sam — a <strong style={{ color: '#E8E4DC', fontWeight: 400 }}>Product Manager and builder</strong> based in the UK, originally from New Zealand. I care about platform thinking, technical excellence, and the kind of ambition that aims at Mars rather than the next feature.</p>
                <p style={{ marginTop: '1rem' }}>By day I&apos;m building AI infrastructure for a major UK financial institution — connecting architecture, creating knowledge layers, and making AI work inside some of the most regulated environments in the world. On the side I&apos;m building a portfolio of internet businesses.</p>
                <p style={{ marginTop: '1rem' }}>I believe great products come from great teams. I care about culture, about building environments where people do the best work of their careers.</p>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #252620', margin: '3.5rem 0' }} />

            <section className="fade-up" style={{ animationDelay: '0.4s' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '2rem' }}>
                <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C8A96E' }}>Right now</span>
                <div style={{ flex: 1, height: 1, background: '#252620' }} />
              </div>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <NowItem label="Working on">
                  <p>An AI-enhanced commercial lending solution at work. Building a unified data layer that turns a bank&apos;s architecture into an AI knowledge base.</p>
                  <p style={{ marginTop: '0.5rem' }}>Several internet business ideas in stealth. First launches coming soon.</p>
                </NowItem>
                <NowItem label="Thinking about">
                  The gap between people who talk about building things and people who actually ship them. Closing that gap, personally.
                </NowItem>
              </div>
            </section>
          </>
        )}

        {/* NOW */}
        {activePage === 'now' && (
          <>
            <div className="fade-up" style={{ padding: '7rem 0 5rem', animationDelay: '0.1s' }}>
              <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7870', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ display: 'inline-block', width: '2rem', height: '1px', background: '#8A7249' }} />
                Last updated — April 2026
              </div>
              <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(2.8rem, 7vw, 4.2rem)', fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#E8E4DC' }}>
                What I&apos;m doing <em style={{ fontStyle: 'italic', color: '#C8A96E' }}>now.</em>
              </h1>
            </div>

            <section className="fade-up" style={{ animationDelay: '0.3s' }}>
              <SectionHeader label="At work" />
              <NowItem label="Day job">
                <p>Building AI solutions for a major UK financial institution. The current focus: connecting siloed architecture into a single source of truth — a knowledge layer that works for traditional use cases today and an AI knowledge base tomorrow.</p>
                <p style={{ marginTop: '0.5rem' }}>Recently launched an async customer messaging capability. Now deep in a complex commercial lending lead processing solution with AI at its core.</p>
              </NowItem>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #252620', margin: '3.5rem 0' }} />

            <section className="fade-up" style={{ animationDelay: '0.45s' }}>
              <SectionHeader label="Building" />
              <NowItem label="Side projects">
                <p>Building a portfolio of niche internet businesses. First projects are in stealth — focused on lead generation directories in underserved UK markets.</p>
                <p style={{ marginTop: '0.5rem' }}>The goal: ship something real, learn from it, repeat. Building the execution muscle.</p>
              </NowItem>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #252620', margin: '3.5rem 0' }} />

            <section className="fade-up" style={{ animationDelay: '0.6s' }}>
              <SectionHeader label="Life" />
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <NowItem label="Location">Lincoln, UK. Spent 20+ years in New Zealand.</NowItem>
                <NowItem label="Thinking about">The difference between planning and shipping. Massive ambition — the kind that sets a goal and doesn&apos;t shrink it when it gets hard. What it actually takes to build high-performing teams from scratch.</NowItem>
              </div>
            </section>
          </>
        )}

        {/* WORK */}
        {activePage === 'work' && (
          <>
            <div className="fade-up" style={{ padding: '7rem 0 5rem', animationDelay: '0.1s' }}>
              <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7870', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ display: 'inline-block', width: '2rem', height: '1px', background: '#8A7249' }} />
                Things I&apos;ve built
              </div>
              <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(2.8rem, 7vw, 4.2rem)', fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#E8E4DC', marginBottom: '2rem' }}>
                Work &amp; <em style={{ fontStyle: 'italic', color: '#C8A96E' }}>Projects.</em>
              </h1>
              <p style={{ fontSize: '0.95rem', color: '#7A7870', maxWidth: 520, lineHeight: 1.85 }}>A mix of day job work and personal projects. This page grows as I ship things.</p>
            </div>

            <section className="fade-up" style={{ animationDelay: '0.3s' }}>
              <SectionHeader label="Professional" />
              <div style={{ display: 'grid', gap: '1rem' }}>
                <WorkItem title="AI Knowledge Layer — Major UK Bank" desc="Connecting siloed architecture into a unified data platform. Built for traditional use cases today, AI-native tomorrow." tag="Active" tagColor="#4A7C59" />
                <WorkItem title="Commercial Lending AI" desc="AI-enhanced lead processing for complex commercial lending. Bringing intelligence into one of the most regulated pipelines in UK finance." tag="Active" tagColor="#4A7C59" />
                <WorkItem title="Async Customer Messaging" desc="Launched an asynchronous messaging capability for customer service operations at a major UK financial institution." tag="Shipped" />
              </div>
            </section>

            <hr style={{ border: 'none', borderTop: '1px solid #252620', margin: '3.5rem 0' }} />

            <section className="fade-up" style={{ animationDelay: '0.45s' }}>
              <SectionHeader label="Side projects" />
              <WorkItem title="Niche internet businesses" desc="Building a portfolio of lead generation directories targeting underserved UK markets. First launches coming in 2026." tag="Stealth" tagColor="#8A7249" />
            </section>
          </>
        )}

        {/* WRITING */}
        {activePage === 'writing' && (
          <>
            <div className="fade-up" style={{ padding: '7rem 0 5rem', animationDelay: '0.1s' }}>
              <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7870', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ display: 'inline-block', width: '2rem', height: '1px', background: '#8A7249' }} />
                Occasional writing
              </div>
              <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(2.8rem, 7vw, 4.2rem)', fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#E8E4DC', marginBottom: '2rem' }}>
                Things I&apos;ve <em style={{ fontStyle: 'italic', color: '#C8A96E' }}>thought about.</em>
              </h1>
              <p style={{ fontSize: '0.95rem', color: '#7A7870', maxWidth: 520, lineHeight: 1.85 }}>I write when I have something worth saying. No cadence, no newsletter, no content strategy. Just thinking out loud.</p>
            </div>
            <section className="fade-up" style={{ animationDelay: '0.3s' }}>
              <SectionHeader label="Posts" />
              <p style={{ fontSize: '0.875rem', color: '#7A7870', lineHeight: 1.75, fontStyle: 'italic' }}>Nothing here yet. First post coming soon.</p>
            </section>
          </>
        )}

        {/* Footer */}
        <footer className="fade-up" style={{ padding: '4rem 0 3rem', animationDelay: '0.85s' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2rem', borderTop: '1px solid #252620' }}>
            <span style={{ fontSize: '0.75rem', color: '#7A7870' }}>sambuxton.dev</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="https://www.linkedin.com/in/industry-of-sam/" target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#7A7870', letterSpacing: '0.05em', transition: 'color 0.2s' }}>LinkedIn</a>
              <a href="https://x.com/IndustryOfSam" target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#7A7870', letterSpacing: '0.05em', transition: 'color 0.2s' }}>Twitter / X</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '2rem' }}>
      <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C8A96E' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: '#252620' }} />
    </div>
  )
}

function NowItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#161714', border: '1px solid #252620', borderRadius: 3, padding: '1.5rem' }}>
      <div style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A7249', marginBottom: '0.75rem' }}>{label}</div>
      <div style={{ fontSize: '0.9rem', color: '#E8E4DC', lineHeight: 1.75 }}>{children}</div>
    </div>
  )
}

function WorkItem({ title, desc, tag, tagColor }: { title: string; desc: string; tag: string; tagColor?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'start', gap: '1rem', padding: '1.25rem 1.5rem', background: '#161714', border: '1px solid #252620', borderRadius: 3 }}>
      <div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: '1rem', fontWeight: 400, color: '#E8E4DC', marginBottom: '0.35rem' }}>{title}</div>
        <div style={{ fontSize: '0.82rem', color: '#7A7870', lineHeight: 1.65 }}>{desc}</div>
      </div>
      <span style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: tagColor ?? '#7A7870', border: `1px solid ${tagColor ?? '#252620'}`, borderRadius: 2, padding: '0.25rem 0.5rem', whiteSpace: 'nowrap' }}>{tag}</span>
    </div>
  )
}
