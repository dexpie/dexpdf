import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const ALLOWED_LAYOUTS = new Set(['flowing', 'continuous', 'exact'])
const ALLOWED_OCR_MODES = new Set(['auto', 'force', 'never'])
const ALLOWED_OCR_LANGUAGES = new Set([
    'auto', 'ar', 'ca', 'zh', 'da', 'nl', 'en', 'fi', 'fr', 'de', 'el',
    'ko', 'it', 'ja', 'no', 'pl', 'pt', 'ro', 'ru', 'sl', 'es', 'sv',
    'tr', 'ua', 'th'
])

export async function POST(request) {
    try {
        const contentType = request.headers.get('content-type') || ''
        if (!contentType.includes('multipart/form-data') && !contentType.includes('application/x-www-form-urlencoded')) {
            return NextResponse.json({ error: 'Expected a form-data request' }, { status: 400 })
        }
        const formData = await request.formData()
        const file = formData.get('file')
        const format = formData.get('format')
        const apiKey = formData.get('apiKey') || process.env.CONVERT_API_SECRET
        const requestedLayout = String(formData.get('layout') || 'flowing').toLowerCase()
        const requestedOcrMode = String(formData.get('ocrMode') || 'auto').toLowerCase()
        const requestedOcrLanguage = String(formData.get('ocrLanguage') || 'auto').toLowerCase()

        if (!file || !format) {
            return NextResponse.json({ error: 'Missing file or format' }, { status: 400 })
        }
        if (!['docx'].includes(String(format).toLowerCase())) {
            return NextResponse.json({ error: 'Unsupported conversion format' }, { status: 400 })
        }
        if (file.size > 50 * 1024 * 1024) {
            return NextResponse.json({ error: 'File is too large (max 50MB)' }, { status: 413 })
        }

        if (!apiKey || apiKey === 'your_secret_here') {
            return NextResponse.json({ error: 'Server Key not configured. Please use your own key.' }, { status: 401 })
        }

        const layout = ALLOWED_LAYOUTS.has(requestedLayout) ? requestedLayout : 'flowing'
        const ocrMode = ALLOWED_OCR_MODES.has(requestedOcrMode) ? requestedOcrMode : 'auto'
        const ocrLanguage = ALLOWED_OCR_LANGUAGES.has(requestedOcrLanguage) ? requestedOcrLanguage : 'auto'

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64File = buffer.toString('base64')

        const payload = {
            "Parameters": [
                {
                    "Name": "File",
                    "FileValue": {
                        "Name": file.name,
                        "Data": base64File
                    }
                },
                {
                    "Name": "Layout",
                    "Value": layout
                },
                {
                    "Name": "OcrMode",
                    "Value": ocrMode
                },
                {
                    "Name": "OcrLanguage",
                    "Value": ocrLanguage
                },
                {
                    "Name": "OcrEngine",
                    "Value": "native"
                },
                {
                    "Name": "Annotations",
                    "Value": "textBox"
                },
                {
                    "Name": "StoreFile",
                    "Value": true
                }
            ]
        }

        const convertUrl = `https://v2.convertapi.com/convert/pdf/to/${format}`

        const requestOptions = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }
        let response = await fetch(convertUrl, requestOptions)

        // Existing deployments may still use a legacy ConvertAPI secret instead
        // of the newer bearer token. Retry once with the legacy auth format.
        if (response.status === 401) {
            response = await fetch(`${convertUrl}?Secret=${encodeURIComponent(apiKey)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: requestOptions.body
            })
        }

        if (!response.ok) {
            const errorText = await response.text()
            let errorDetails = { Message: errorText }
            try {
                errorDetails = JSON.parse(errorText)
            } catch {}

            console.error('ConvertAPI Error:', errorDetails)
            const code = response.status === 401
                ? 'CLOUD_AUTH_INVALID'
                : response.status === 429
                    ? 'CLOUD_QUOTA_EXHAUSTED'
                    : 'CLOUD_CONVERSION_FAILED'
            const message = response.status === 401
                ? 'ConvertAPI credentials are missing, invalid, or expired.'
                : errorDetails.Message || errorDetails.message || response.statusText

            return NextResponse.json({ error: message, code }, { status: response.status })
        }

        const data = await response.json()

        if (data.Files && data.Files.length > 0) {
            const fileUrl = data.Files[0].Url
            const fileRes = await fetch(fileUrl)
            if (!fileRes.ok) {
                return NextResponse.json({ error: 'Converted file could not be downloaded.' }, { status: 502 })
            }
            const fileBlob = await fileRes.blob()

            return new NextResponse(fileBlob, {
                headers: {
                    'Content-Type': data.Files[0].ContentType || 'application/octet-stream',
                    'Content-Disposition': `attachment; filename="${data.Files[0].FileName}"`,
                    'Cache-Control': 'no-store',
                },
            })
        }

        return NextResponse.json({ error: 'No file generated' }, { status: 500 })

    } catch (error) {
        console.error('Proxy Error:', error)
        return NextResponse.json(
            { error: 'Conversion failed: ' + error.message },
            { status: 500 }
        )
    }
}
