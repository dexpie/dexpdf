import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic' // Static optimization breaks form-data

export async function POST(request) {
    try {
        const formData = await request.formData()

        // Forward the request to OCR.Space
        const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            headers: {
                'apikey': 'K87899142388957', // Use server-side key or env var
            },
            body: formData,
        })

        const data = await response.json()

        return NextResponse.json(data)
    } catch (error) {
        console.error('OCR Proxy Error:', error)
        return NextResponse.json(
            { ErrorMessage: 'Internal Server Error: ' + error.message },
            { status: 500 }
        )
    }
}
