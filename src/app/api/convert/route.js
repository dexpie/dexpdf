import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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

        // 1. Convert File to Buffer then Base64
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64File = buffer.toString('base64')

        // 2. Prepare JSON Payload for ConvertAPI
        // Docs: https://www.convertapi.com/doc/upload (Base64 content)
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
                    "Name": "StoreFile",
                    "Value": true
                }
            ]
        }

        // 3. Send Request
        // Endpoint: https://v2.convertapi.com/convert/pdf/to/{format}?Secret={apiKey}
        const convertUrl = `https://v2.convertapi.com/convert/pdf/to/${format}?Secret=${apiKey}`

        const response = await fetch(convertUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            let errorDetails = {}
            try {
                errorDetails = await response.json()
            } catch (e) {
                errorDetails = { Message: await response.text() }
            }
            console.error('ConvertAPI Error:', errorDetails)
            return NextResponse.json({ error: errorDetails.Message || response.statusText }, { status: response.status })
        }

        const data = await response.json()

        // 4. Handle Response
        // ConvertAPI returns JSON with Files array. We need to fetch the file URL and stream it back.
        if (data.Files && data.Files.length > 0) {
            const fileUrl = data.Files[0].Url
            const fileRes = await fetch(fileUrl)
            const fileBlob = await fileRes.blob()

            return new NextResponse(fileBlob, {
                headers: {
                    'Content-Type': data.Files[0].ContentType || 'application/octet-stream',
                    'Content-Disposition': `attachment; filename="${data.Files[0].FileName}"`,
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
