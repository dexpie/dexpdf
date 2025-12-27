'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import ToolCard from './ToolCard'

export default function Features({ tools = [] }) {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const GROUPS = {
    'create': {
      title: t('category.create', 'Create New'),
      ids: ['invoice-generator', 'resume-builder', 'certificate-maker']
    },
    'optimize': {
      title: t('category.optimize', 'Optimize PDF'),
      ids: ['merge', 'split', 'compress', 'organize', 'pdf-info', 'smart-organize']
    },
    'convert_to': {
      title: t('category.convert_to', 'Convert to PDF'),
      ids: ['imgs2pdf', 'word2pdf', 'ppt2pdf', 'excel2pdf', 'html2pdf', 'csv2pdf']
    },
    'convert_from': {
      title: t('category.convert_from', 'Convert from PDF'),
      ids: ['pdf2imgs', 'pdf2word', 'pdf2ppt', 'pdf2text', 'extract-images', 'pdf2excel']
    },
    'edit_security': {
      title: t('category.edit', 'Edit & Security'),
      ids: ['edit', 'signature', 'watermark', 'ocr', 'protect', 'unlock', 'annotate', 'pagenums', 'redact', 'scrub']
    }
  }

  const getGroupTools = (groupIds) => {
    return tools.filter(t => groupIds.includes(t.id))
  }

  return (
    <div className="space-y-16">
      {Object.entries(GROUPS).map(([key, group]) => {
        const groupTools = getGroupTools(group.ids)
        if (groupTools.length === 0) return null

        return (
          <section key={key} className="scroll-mt-24" id={key}>
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              {group.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {groupTools.map(tool => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        )
      })}

      {/* Fallback for uncategorized tools if any */}
      {tools.length > 0 && (
        <div className="hidden">
          {/* Logic to show tools not in any group if needed, 
                 but for now we assume manual grouping covers all important ones.
             */}
        </div>
      )}
    </div>
  )
}
