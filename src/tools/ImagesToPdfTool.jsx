import React, { useState } from 'react'
// jsPDF will be dynamically imported when creating the PDF to avoid inflating initial bundle

export default function ImagesToPdfTool() {
	const [images, setImages] = useState([])
	const [busy, setBusy] = useState(false)
	const [mode, setMode] = useState('fit') // fit | fill | actual
	const [errorMsg, setErrorMsg] = useState('')
	const [successMsg, setSuccessMsg] = useState('')
	const errorRef = React.useRef(null);
	const successRef = React.useRef(null);
	React.useEffect(() => { if (errorMsg && errorRef.current) errorRef.current.focus(); }, [errorMsg]);
	React.useEffect(() => { if (successMsg && successRef.current) successRef.current.focus(); }, [successMsg]);

	async function onFiles(e) {
		setErrorMsg(''); setSuccessMsg('');
		const list = Array.from(e.target.files)
		const loaded = []
		for (const f of list) {
			if (!f.type.startsWith('image/')) {
				setErrorMsg('Semua file harus gambar.');
				continue;
			}
			if (f.size > 20 * 1024 * 1024) {
				setErrorMsg('Ukuran gambar terlalu besar (maks 20MB).');
				continue;
			}
			try {
				const data = await fileToImage(f)
				loaded.push({ file: f, dataUrl: data.dataUrl, thumb: data.dataUrl, width: data.width, height: data.height })
			} catch (err) {
				console.warn('failed to load image', f, err)
			}
		}
		if (loaded.length) setImages(prev => prev.concat(loaded))
	}

	function remove(i) { setImages(prev => prev.filter((_, idx) => idx !== i)) }

	function onDragStart(e, idx) {
		e.dataTransfer.setData('text/plain', String(idx))
		e.dataTransfer.effectAllowed = 'move'
	}

	function onDragOver(e) {
		e.preventDefault()
		e.dataTransfer.dropEffect = 'move'
	}

	function onDrop(e, idx) {
		e.preventDefault()
		const from = Number(e.dataTransfer.getData('text/plain'))
		if (Number.isNaN(from)) return
		setImages(prev => {
			const copy = prev.slice()
			const [item] = copy.splice(from, 1)
			copy.splice(idx, 0, item)
			return copy
		})
	}

	function fileToImage(file) {
		return new Promise((resolve, reject) => {
			const r = new FileReader()
			r.onload = () => {
				const img = new Image()
				img.onload = () => resolve({ dataUrl: r.result, width: img.naturalWidth, height: img.naturalHeight })
				img.onerror = reject
				img.src = r.result
			}
			r.onerror = reject
			r.readAsDataURL(file)
		})
	}

	async function makePdf() {
		if (images.length === 0) return
		setBusy(true)
		try {
			const { jsPDF } = await import('jspdf')
			const unit = 'mm'
			const pxToMm = 25.4 / 96 // assume 96 DPI
			const A4W = 210
			const A4H = 297

			const doc = new jsPDF({ unit, format: [A4W, A4H] })

			for (let i = 0; i < images.length; i++) {
				const entry = images[i]
				const dataUrl = entry.dataUrl || entry.thumb
				const width = entry.width
				const height = entry.height

				if (!dataUrl) {
					console.warn('skip image with no dataUrl/thumb', entry)
					continue
				}

				const pageW = A4W
				const pageH = A4H
				if (i > 0) doc.addPage()

				const margin = 10
				const maxW = pageW - margin * 2
				const maxH = pageH - margin * 2

				const imgWmm = width * pxToMm
				const imgHmm = height * pxToMm

				let drawW, drawH, x, y
				if (mode === 'fit') {
					const scale = Math.min(maxW / imgWmm, maxH / imgHmm, 1)
					drawW = imgWmm * scale
					drawH = imgHmm * scale
					x = (pageW - drawW) / 2
					y = (pageH - drawH) / 2
				} else if (mode === 'fill') {
					const scale = Math.max(maxW / imgWmm, maxH / imgHmm)
					drawW = imgWmm * scale
					drawH = imgHmm * scale
					x = (pageW - drawW) / 2
					y = (pageH - drawH) / 2
				} else {
					drawW = Math.min(imgWmm, maxW)
					drawH = Math.min(imgHmm, maxH)
					x = (pageW - drawW) / 2
					y = (pageH - drawH) / 2
				}

				const imgFormat = (typeof dataUrl === 'string' && dataUrl.indexOf('image/png') >= 0) ? 'PNG' : 'JPEG'
				try {
					doc.addImage(dataUrl, imgFormat, x, y, drawW, drawH)
				} catch (e) {
					console.error('addImage failed for entry', i, e)
				}
			}

			doc.save('images.pdf')
			setSuccessMsg('PDF berhasil dibuat dan diunduh!')
		} catch (err) {
			console.error(err)
			setErrorMsg('Gagal membuat PDF: ' + (err.message || err))
		} finally {
			setBusy(false)
		}
	}

	return (
		<div style={{ maxWidth: 520, margin: '0 auto', padding: 12 }}>
			<h2 style={{ textAlign: 'center', marginBottom: 16 }}>Images → PDF</h2>
			{errorMsg && (
				<div ref={errorRef} tabIndex={-1} aria-live="assertive" style={{ color: '#dc2626', marginBottom: 8, background: '#fee2e2', padding: 8, borderRadius: 6, outline: 'none' }}>{errorMsg}</div>
			)}
			{successMsg && (
				<div ref={successRef} tabIndex={-1} aria-live="polite" style={{ color: '#059669', marginBottom: 8, background: '#d1fae5', padding: 8, borderRadius: 6, outline: 'none' }}>{successMsg}</div>
			)}
			{busy && <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><span className="loader" style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #3b82f6', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', verticalAlign: 'middle' }}></span> <span>Memproses, mohon tunggu...</span></div>}
			<div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
				<label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Mode:</label>
				<select value={mode} onChange={e => setMode(e.target.value)} disabled={busy}>
					<option value="fit">Fit (contain)</option>
					<option value="fill">Fill (cover)</option>
					<option value="actual">Actual size (max page)</option>
				</select>
			</div>
			<div className="dropzone" style={{ opacity: busy ? 0.6 : 1, pointerEvents: busy ? 'none' : 'auto', border: '2px dashed #3b82f6', borderRadius: 16, padding: 24, marginBottom: 16, background: '#f8fafc' }}>
				<input type="file" accept="image/*" multiple onChange={onFiles} disabled={busy} />
				<div className="muted">Select images in the order you want them to appear.</div>
			</div>
			<div className="file-list">
				{images.map((entry, i) => (
					<div className="file-item" key={i} draggable={!busy} onDragStart={e => !busy && onDragStart(e, i)} onDragOver={onDragOver} onDrop={e => !busy && onDrop(e, i)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', borderRadius: 8, marginBottom: 8, padding: 8, opacity: busy ? 0.7 : 1 }}>
						<img src={entry.thumb} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 4 }} alt="thumb" />
						<div style={{ minWidth: 120, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{entry.file.name}</div>
						<div style={{ color: '#888', fontSize: 13 }}>{(entry.file.size / 1024).toFixed(1)} KB</div>
						<button className="btn" onClick={() => remove(i)} disabled={busy}>Remove</button>
					</div>
				))}
			</div>
			<div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
				<button className="btn-primary" onClick={makePdf} disabled={busy || images.length === 0}>{busy ? 'Working...' : 'Create PDF'}</button>
				<button className="btn-ghost" style={{ color: '#dc2626', marginLeft: 'auto' }} onClick={() => { setImages([]); setErrorMsg(''); setSuccessMsg(''); }} disabled={busy || images.length === 0}>Reset</button>
			</div>
		</div>
	)
}

