import fs from 'fs'
import path from 'path'
import ToolPageClient from '@/components/ToolPageClient'

export async function generateMetadata({ params }) {
    // Fetch tools logic (duplicated from home page for now to keep it simple)
    // In production, might want a shared cached utility.
    const filePath = path.join(process.cwd(), 'public', 'tools.json')
    const file = await fs.promises.readFile(filePath, 'utf8')
    const tools = JSON.parse(file)

    const tool = tools.find(x => x.id === params.toolId)

    if (!tool) {
        return {
            title: 'Tool Not Found - DexPDF',
        }
    }

    return {
        title: `${tool.name} - DexPDF`,
        description: tool.desc,
    }
}

export default function Page({ params }) {
    return <ToolPageClient toolId={params.toolId} />
}
