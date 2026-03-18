import { TOOLS } from '@/config/tools'
import ToolPageClient from '@/components/ToolPageClient'

export async function generateMetadata({ params }) {
    const tool = TOOLS.find(x => x.id === params.toolId)

    if (!tool) {
        return {
            title: `${params.toolId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} - DexPDF`,
            description: 'Free online PDF tool',
        }
    }

    return {
        title: `${tool.title} - DexPDF`,
        description: tool.description,
    }
}

export default function Page({ params }) {
    return <ToolPageClient toolId={params.toolId} />
}
