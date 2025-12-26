'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ToolCard from './ToolCard'
import RecentFiles from './RecentFiles'
import Features from './Features'
import FAQ from './FAQ'
import AdSpot from './AdSpot'
import ConsentBanner from './ConsentBanner'
import { getAdConsent } from '@/utils/consent'

export default function HomeClient({ tools }) {
    const { t } = useTranslation()
    const [query, setQuery] = useState('')
    const [adConsent, setAdConsent] = useState(false)
    const searchRef = useRef(null)

    useEffect(() => {
        setAdConsent(getAdConsent())
        const kbHandler = (e) => {
            if (e.key === '/' && !(document.activeElement && (document.activeElement.tagName === 'INPUT'))) {
                e.preventDefault()
                searchRef.current?.focus()
            }
        }
        window.addEventListener('keydown', kbHandler)
        return () => window.removeEventListener('keydown', kbHandler)
    }, [])

    const GROUPS = {
        'optimize': {
            title: t('category.optimize', 'Optimize PDF'),
            ids: ['merge', 'split', 'compress', 'organize', 'pdf-info']
        },
        'convert_to': {
            title: t('category.convert_to', 'Convert to PDF'),
            ids: ['imgs2pdf', 'word2pdf', 'ppt2pdf', 'csv2pdf']
        },
        'convert_from': {
            title: t('category.convert_from', 'Convert from PDF'),
            ids: ['pdf2imgs', 'pdf2word', 'pdf2ppt', 'pdf2text', 'extract-images']
        },
        'edit_security': {
            title: t('category.edit', 'Edit & Security'),
            ids: ['edit', 'signature', 'watermark', 'ocr', 'protect', 'unlock', 'annotate', 'pagenums']
        }
    }

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return tools
        return tools.filter(t => {
            const inName = t.name && t.name.toLowerCase().includes(q)
            const inDesc = t.desc && t.desc.toLowerCase().includes(q)
            const inTags = Array.isArray(t.tags) && t.tags.join(' ').toLowerCase().includes(q)
            return inName || inDesc || inTags
        })
    }, [tools, query])

    const getGroupTools = (groupIds) => {
        return tools.filter(t => groupIds.includes(t.id))
    }

    return (
        <main className="main-content">
            <header className="hero-header">
                <div className="hero-container">
                    <h1 className="hero-title">{t('hero.title')}</h1>
                    <p className="hero-subtitle">{t('hero.subtitle')}</p>

                    <div className="hero-search">
                        <input
                            aria-label="Search PDF tools"
                            className="hero-search-input"
                            placeholder={t('hero.search_placeholder')}
                            ref={searchRef}
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                        {query && (
                            <button className="search-clear" onClick={() => setQuery('')}>×</button>
                        )}
                        <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </header>

            <div className="tools-container" style={{ marginTop: '-60px', position: 'relative', zIndex: 10 }}>
                <div className="recent-section">
                    <RecentFiles />
                </div>

                {adConsent === true && (
                    <div className="ads-section">
                        <div className="ads-label">{t('ads.sponsored')}</div>
                        <AdSpot image="/assets/bippy.jpg" href="https://dexpdf.vercel.app" alt="Sponsor" />
                    </div>
                )}

                <ConsentBanner onChange={(v) => setAdConsent(v)} />

                {query ? (
                    <div className="search-results">
                        <div className="category-section">
                            <h2 className="category-title">{t('search.results_title', { count: filtered.length })}</h2>
                            <div className="tools-grid">
                                {filtered.map(tool => (
                                    <ToolCard key={tool.id} tool={tool} />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="categories-layout">
                        {Object.entries(GROUPS).map(([key, group]) => {
                            const groupTools = getGroupTools(group.ids)
                            if (groupTools.length === 0) return null
                            return (
                                <section key={key} className="category-section">
                                    <h2 className="category-title">{group.title}</h2>
                                    <div className="tools-grid">
                                        {groupTools.map(tool => (
                                            <ToolCard key={tool.id} tool={tool} />
                                        ))}
                                    </div>
                                </section>
                            )
                        })}
                    </div>
                )}
            </div>

            <Features />
            <FAQ />
        </main>
    )
}
