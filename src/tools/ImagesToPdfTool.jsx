import React, { useState } from 'react'
// jsPDF will be dynamically imported when creating the PDF to avoid inflating initial bundle
import { triggerConfetti } from '../utils/confetti'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import ActionButtons from '../components/common/ActionButtons'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Image as ImageIcon, X, GripVertical, FileText, CheckCircle, AlertTriangle, Maximize, Minimize, Expand, RotateCw } from 'lucide-react'

export default function ImagesToPdfTool() {
	const { t } = useTranslation()
	const [images, setImages] = useState([])
	const [busy, setBusy] = useState(false)
	const [mode, setMode] = useState('fit') // fit | fill | actual
	const [errorMsg, setErrorMsg] = useState('')
	const [successMsg, setSuccessMsg] = useState('')

	async function handleFileChange(files) {
		setErrorMsg(''); setSuccessMsg('');
		const list = Array.from(files)
		const loaded = []
		for (const f of list) {
			if (!f.type.startsWith('image/')) {
				setErrorMsg('All files must be images.');
				continue;
			}
			if (f.size > 20 * 1024 * 1024) {
				setErrorMsg('Image is too large (max 20MB).');
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

	const rotateImage = async (index) => {
		const imgEntry = images[index]
		const img = new Image()
		img.src = imgEntry.dataUrl
		await new Promise(r => img.onload = r)

		const canvas = document.createElement('canvas')
		// Swap width and height for 90deg rotation
		canvas.width = img.height
		canvas.height = img.width
		const ctx = canvas.getContext('2d')

		ctx.translate(canvas.width / 2, canvas.height / 2)
		ctx.rotate(90 * Math.PI / 180)
		ctx.drawImage(img, -img.width / 2, -img.height / 2)

		const newDataUrl = canvas.toDataURL()

		setImages(prev => {
			const copy = [...prev]
			copy[index] = {
				...copy[index],
				dataUrl: newDataUrl,
				thumb: newDataUrl,
				width: canvas.width,
				height: canvas.height
			}
			return copy
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
			setSuccessMsg('PDF created and downloaded successfully!')
			triggerConfetti()
		} catch (err) {
			console.error(err)
			setErrorMsg('Failed to create PDF: ' + (err.message || err))
		} finally {
			setBusy(false)
		}
	}

	return (
		<ToolLayout title="Images to PDF" description={t('tool.imagestopdf_desc', 'Convert images to PDF document')}>
			<div className="max-w-6xl mx-auto">
				<AnimatePresence>
					{errorMsg && (
						<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-100 dark:border-red-800 flex items-center gap-2 mb-6">
							<AlertTriangle className="w-5 h-5" /> {errorMsg}
						</motion.div>
					)}
					{successMsg && (
						<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 p-4 rounded-xl border border-green-100 dark:border-green-800 flex items-center gap-2 mb-6">
							<CheckCircle className="w-5 h-5" /> {successMsg}
						</motion.div>
					)}
				</AnimatePresence>

				<FileDropZone
					onFiles={handleFileChange}
					accept="image/*"
					multiple
					disabled={busy}
					hint="Upload images to convert to PDF"
				/>

				{images.length > 0 && (
					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
						<div className="bg-card p-5 rounded-2xl border border-border shadow-sm mb-8">
							<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
								<h3 className="font-bold text-foreground flex items-center gap-2">
									<ImageIcon className="w-5 h-5 text-blue-500" />
									{images.length} Images Selected
								</h3>

								<div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
									{[
										{ id: 'fit', label: 'Fit Page', icon: Minimize },
										{ id: 'fill', label: 'Fill Page', icon: Maximize },
										{ id: 'actual', label: 'Actual Size', icon: Expand }
									].map(m => (
										<button
											key={m.id}
											onClick={() => setMode(m.id)}
											className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${mode === m.id ? 'bg-card dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-muted-foreground dark:text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-600'}`}
										>
											<m.icon className="w-4 h-4" />
											{m.label}
										</button>
									))}
								</div>
							</div>
						</div>

						<Reorder.Group axis="y" values={images} onReorder={setImages} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
							{images.map((entry) => (
								<Reorder.Item
									key={entry.dataUrl} // Use dataUrl as key for now, ideally unique ID
									value={entry}
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.9 }}
									className="group relative bg-card dark:bg-slate-800 p-2 rounded-xl border border-border dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-move hover:border-blue-300 dark:hover:border-blue-500"
								>
									<div className="absolute top-2 left-2 z-10 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
										{images.indexOf(entry) + 1}
									</div>

									<div className="aspect-[3/4] bg-secondary rounded-lg overflow-hidden mb-2 relative flex items-center justify-center">
										<img src={entry.thumb} className="w-full h-full object-cover" alt="thumb" />

										<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
											<GripVertical className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 drop-shadow-lg" />
										</div>

										{/* Rotate Button */}
										<button
											className="absolute bottom-2 right-2 bg-card/90 text-foreground rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-card hover:text-blue-600"
											onClick={(e) => { e.stopPropagation(); rotateImage(images.indexOf(entry)); }}
											disabled={busy}
											title="Rotate 90°"
										>
											<RotateCw className="w-4 h-4" />
										</button>

										<button
											className="absolute top-2 right-2 bg-card text-red-500 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-red-50 transform hover:scale-110"
											onClick={(e) => { e.stopPropagation(); remove(images.indexOf(entry)); }}
											disabled={busy}
										>
											<X className="w-4 h-4" />
										</button>
									</div>
									<div className="text-xs text-center truncate text-slate-600 font-medium px-1">{entry.file.name}</div>
								</Reorder.Item>
							))}

							<div className="flex flex-col items-center justify-center aspect-[3/4] bg-secondary rounded-xl border-2 border-dashed border-border hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer text-muted-foreground hover:text-blue-500" onClick={() => document.querySelector('input[type=file]').click()}>
								<ImageIcon className="w-8 h-8 mb-2" />
								<span className="text-xs font-semibold">Add More</span>
							</div>
						</Reorder.Group>

						<div className="flex justify-end sticky bottom-6 z-10">
							<div className="bg-card p-4 rounded-2xl shadow-xl border border-border flex gap-4">
								<button
									className="px-6 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-slate-100 transition-colors"
									onClick={() => { setImages([]); setErrorMsg(''); setSuccessMsg(''); }}
								>
									Reset
								</button>
								<ActionButtons
									primaryText="Create PDF"
									onPrimary={makePdf}
									loading={busy}
									icon={FileText}
								/>
							</div>
						</div>
					</motion.div>
				)}
			</div>
		</ToolLayout>
	)
}
