import React, { useState } from 'react'
import jsPDF from 'jspdf'

export default function ImagesToPdfTool(){
		const [images, setImages] = useState([])
	const [busy, setBusy] = useState(false)
	const [mode, setMode] = useState('fit') // fit | fill | actual

		async function onFiles(e){
				const list = Array.from(e.target.files)
				const loaded = []
				for(const f of list){
					try{
						const data = await fileToImage(f)
						// normalize: keep both `dataUrl` and `thumb` so other code can use either
						loaded.push({ file: f, dataUrl: data.dataUrl, thumb: data.dataUrl, width: data.width, height: data.height })
					}catch(err){
						console.warn('failed to load image', f, err)
					}
				}
				if(loaded.length) setImages(prev => prev.concat(loaded))
		}

		function remove(i){ setImages(prev => prev.filter((_,idx)=>idx!==i)) }

		function onDragStart(e, idx){
			e.dataTransfer.setData('text/plain', String(idx))
			e.dataTransfer.effectAllowed = 'move'
		}

		function onDragOver(e){ e.preventDefault(); e.dataTransfer.dropEffect = 'move' }

		function onDrop(e, idx){
			e.preventDefault()
			const from = Number(e.dataTransfer.getData('text/plain'))
			if(Number.isNaN(from)) return
			setImages(prev => {
				const copy = prev.slice()
				const [item] = copy.splice(from,1)
				copy.splice(idx,0,item)
				return copy
			})
		}

	// helper: load image and return dataUrl + natural size
	function fileToImage(file){
		return new Promise((resolve,reject)=>{
			const r = new FileReader()
			r.onload = ()=>{
				const img = new Image()
				img.onload = ()=> resolve({dataUrl: r.result, width: img.naturalWidth, height: img.naturalHeight})
				img.onerror = reject
				img.src = r.result
			}
			r.onerror = reject
			r.readAsDataURL(file)
		})
	}

	async function makePdf(){
		if(images.length===0) return
		setBusy(true)
		try{
			// Preload all images to get sizes
			const imgs = images // already loaded with dataUrl and sizes

			const unit = 'mm'
			const pxToMm = 25.4 / 96 // assume 96 DPI
			const A4W = 210
			const A4H = 297

			// create A4 portrait document and fit each image inside the page
			const doc = new jsPDF({ unit, format: [A4W, A4H] })

			for (let i = 0; i < imgs.length; i++) {
								// support entries that may have either `dataUrl` or `thumb`
								const entry = imgs[i]
								const dataUrl = entry.dataUrl || entry.thumb
								const width = entry.width
								const height = entry.height
								if(!dataUrl){
									console.warn('skip image with no dataUrl/thumb', entry)
									continue
								}
				// always use A4 portrait page
				const pageW = A4W
				const pageH = A4H
				if (i > 0) doc.addPage()

				// available area with small margins
				const margin = 10
				const maxW = pageW - margin * 2
				const maxH = pageH - margin * 2

				const imgWmm = width * pxToMm
				const imgHmm = height * pxToMm
				let drawW, drawH
				if(mode === 'actual'){
					drawW = Math.min(imgWmm, maxW)
					drawH = Math.min(imgHmm, maxH)
				} else if(mode === 'fill'){
					// cover: fill the area, may crop
					const scaleFill = Math.max(maxW / imgWmm, maxH / imgHmm)
					drawW = imgWmm * scaleFill
					drawH = imgHmm * scaleFill
				} else {
					// fit (contain)
					const scale = Math.min(maxW / imgWmm, maxH / imgHmm, 1)
					drawW = imgWmm * scale
					drawH = imgHmm * scale
				}
				const x = (pageW - drawW) / 2
				const y = (pageH - drawH) / 2

				const imgFormat = (typeof dataUrl === 'string' && dataUrl.indexOf('image/png') >= 0) ? 'PNG' : 'JPEG'
				try{
					doc.addImage(dataUrl, imgFormat, x, y, drawW, drawH)
				}catch(e){
					console.error('addImage failed for entry', i, e)
				}
			}

			doc.save('images.pdf')
		}catch(err){console.error(err); alert('Failed: '+(err.message||err))}
		finally{setBusy(false)}
	}

	return (
		<div>
			<h2>Images → PDF</h2>
			<div style={{display:'flex',gap:8,alignItems:'center'}}>
				<label style={{display:'flex',alignItems:'center',gap:6}}>Mode:</label>
				<select value={mode} onChange={e=>setMode(e.target.value)}>
					<option value="fit">Fit (contain)</option>
					<option value="fill">Fill (cover)</option>
					<option value="actual">Actual size (max page)</option>
				</select>
			</div>
			<div className="dropzone">
				<input type="file" accept="image/*" multiple onChange={onFiles} />
				<div className="muted">Select images in the order you want them to appear.</div>
			</div>
					<div className="file-list">
						{images.map((entry,i)=>(
							<div className="file-item" key={i} draggable onDragStart={(e)=>onDragStart(e,i)} onDragOver={onDragOver} onDrop={(e)=>onDrop(e,i)}>
								<div style={{display:'flex',alignItems:'center',gap:12}}>
									<div style={{width:56,height:40,flex:'none',background:'#f4f6fb',display:'flex',alignItems:'center',justifyContent:'center'}}>
										{entry.thumb ? <img src={entry.thumb} style={{maxWidth:'100%',maxHeight:'100%'}} alt="thumb"/> : <div className="muted">IMG</div>}
									</div>
									<div style={{minWidth:200,overflow:'hidden',textOverflow:'ellipsis'}}>{entry.file.name}</div>
								</div>
								<div><button className="btn" onClick={()=>remove(i)}>Remove</button></div>
							</div>
						))}
					</div>
			<div style={{marginTop:12}}>
				<button className="btn" onClick={makePdf} disabled={busy || images.length===0}>{busy? 'Working...' : 'Create PDF'}</button>
			</div>
		</div>
	)
}

