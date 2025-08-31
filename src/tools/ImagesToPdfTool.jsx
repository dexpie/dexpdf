import React, { useState, useRef } from 'react'
import jsPDF from 'jspdf'

function ImagesToPdfTool(){
		const [images, setImages] = useState([])
		const [busy, setBusy] = useState(false)
		const [mode, setMode] = useState('fit') // 'fit' or 'cover'
		const [pageSize, setPageSize] = useState('A4') // 'A4' | 'Letter' | 'Custom'
		const [customW, setCustomW] = useState(210)
		const [customH, setCustomH] = useState(297)
		const [margin, setMargin] = useState(10)
		const [previewUrl, setPreviewUrl] = useState(null)
		const previewWindowRef = useRef(null)

		async function onFiles(e){
			const list = Array.from(e.target.files)
			const loaded = []
			for(const f of list){
				const data = await fileToImage(f)
				loaded.push({file: f, thumb: data.dataUrl, width: data.width, height: data.height})
			}
			setImages(prev => prev.concat(loaded))
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

		async function makePdf({download=true, showPreview=false}={download:true, showPreview:false}){
		if(images.length===0) return
		setBusy(true)
		try{
			// Preload all images to get sizes
			const imgs = images // already loaded with dataUrl and sizes

				const unit = 'mm'
				const sizes = {
					A4: [210,297],
					Letter: [216,279]
				}
				const A4W = sizes.A4[0]
				const A4H = sizes.A4[1]


			// create doc based on first image orientation
				const first = imgs[0]
				const firstIsLandscape = first.width >= first.height
				// choose page size per user selection (use first image orientation by default)
				let baseW, baseH
				if(pageSize === 'Custom'){
					baseW = Number(customW) || A4W
					baseH = Number(customH) || A4H
				}else{
					baseW = sizes[pageSize][0]
					baseH = sizes[pageSize][1]
				}
				const doc = new jsPDF({unit, format: firstIsLandscape ? [baseH, baseW] : [baseW, baseH]})

							for(let i=0;i<imgs.length;i++){
								// support entries that may have either `dataUrl` or `thumb`
								const entry = imgs[i]
								const dataUrl = entry.dataUrl || entry.thumb
								const width = entry.width
								const height = entry.height
								const file = entry.file || entry.file
								if(!dataUrl){
									console.warn('skip image with no dataUrl/thumb', entry)
									continue
								}
				const isLandscape = width >= height
				const pageW = isLandscape ? baseH : baseW
				const pageH = isLandscape ? baseW : baseH

						if(i>0) doc.addPage([pageW, pageH])

				// available area with user margin (in mm)
				const m = Number(margin) || 0
				const maxW = pageW - m * 2
				const maxH = pageH - m * 2

				// Fit by aspect ratio; mode 'fit' keeps whole image visible, 'cover' fills page and may crop
				const imgAspect = width / height
				let drawW, drawH
				if(mode === 'fit'){
					// fit inside maxW x maxH
					drawW = maxW
					drawH = drawW / imgAspect
					if(drawH > maxH){
						drawH = maxH
						drawW = drawH * imgAspect
					}
				} else {
					// cover: fill area, may be larger than page and thus be clipped
					drawW = maxW
					drawH = drawW / imgAspect
					if(drawH < maxH){
						// when height doesn't fill, scale by height
						drawH = maxH
						drawW = drawH * imgAspect
					}
				}
				const x = (pageW - drawW) / 2
				const y = (pageH - drawH) / 2

		const imgFormat = (typeof dataUrl === 'string' && dataUrl.indexOf('image/png') >= 0) ? 'PNG' : 'JPEG'
		doc.addImage(dataUrl, imgFormat, x, y, drawW, drawH)
			}

				if(showPreview){
					const dataUri = doc.output('datauristring')
					setPreviewUrl(dataUri)
					// try to open preview in a new window or reuse the previous one
					try{
						if(previewWindowRef.current && !previewWindowRef.current.closed){
							previewWindowRef.current.location.href = dataUri
						}else{
							previewWindowRef.current = window.open(dataUri)
						}
					}catch(e){
						// fallback: keep previewUrl state for inline iframe
						console.warn('preview open failed', e)
					}
				}
				if(download) doc.save('images.pdf')
		}catch(err){console.error(err); alert('Failed: '+(err.message||err))}
		finally{setBusy(false)}
	}

	return (
		<div>
			<h2>Images → PDF</h2>
				<div className="dropzone">
				<input type="file" accept="image/*" multiple onChange={onFiles} />
				<div className="muted">Select images in the order you want them to appear.</div>
			</div>
				<div style={{display:'flex',gap:12,marginTop:8,alignItems:'center'}}>
					<label style={{display:'flex',gap:8,alignItems:'center'}}>
						Mode:
						<select value={mode} onChange={e=>setMode(e.target.value)}>
							<option value="fit">Fit (no crop)</option>
							<option value="cover">Cover (fill, may crop)</option>
						</select>
					</label>
					<label style={{display:'flex',gap:8,alignItems:'center'}}>
						Page:
						<select value={pageSize} onChange={e=>setPageSize(e.target.value)}>
							<option value="A4">A4</option>
							<option value="Letter">Letter</option>
							<option value="Custom">Custom</option>
						</select>
					</label>
					{pageSize === 'Custom' && (
						<div style={{display:'flex',gap:8,alignItems:'center'}}>
							<input type="number" value={customW} onChange={e=>setCustomW(e.target.value)} style={{width:80}} />
							x
							<input type="number" value={customH} onChange={e=>setCustomH(e.target.value)} style={{width:80}} />
							mm
						</div>
					)}
					<label style={{display:'flex',gap:8,alignItems:'center'}}>
						Margin:
						<input type="number" value={margin} onChange={e=>setMargin(e.target.value)} style={{width:80}} />
						mm
					</label>
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
			<div style={{marginTop:12,display:'flex',gap:8}}>
				<button className="btn" onClick={()=>makePdf({download:true, showPreview:false})} disabled={busy || images.length===0}>{busy? 'Working...' : 'Create PDF'}</button>
				<button className="btn" onClick={()=>makePdf({download:false, showPreview:true})} disabled={busy || images.length===0}>Preview</button>
			</div>
			{previewUrl && (
				<div style={{marginTop:12}}>
					<div className="muted">Preview (close tab/window to dismiss):</div>
					<iframe title="pdf-preview" src={previewUrl} style={{width:'100%',height:400,border:'1px solid #ddd'}} />
				</div>
			)}
		</div>
	)
}

export default ImagesToPdfTool

