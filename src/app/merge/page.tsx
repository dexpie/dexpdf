import ToolPageClient from '@/components/ToolPageClient'

export const metadata = {
  title: 'Merge PDF - DexPDF',
  description: 'Combine multiple PDFs into one.',
}

export default function MergePage() {
  return <ToolPageClient toolId="merge" />
}
