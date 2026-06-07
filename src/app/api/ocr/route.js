import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic' // Static optimization breaks form-data

export async function POST(request) {
    try {
        const apiKey = process.env.OCR_SPACE_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { ErrorMessage: 'OCR service is not configured.' },
                { status: 503 }
            )
        }
        const formData = await request.formData()

        // Forward the request to OCR.Space
        const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            headers: {
                'apikey': apiKey,
            },
            body: formData,
        })

        const data = await response.json()
        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('OCR Proxy Error:', error)
        return NextResponse.json(
            { ErrorMessage: 'Internal Server Error: ' + error.message },
            { status: 500 }
        )
    }
}
