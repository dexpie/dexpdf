import React, { useRef, useEffect } from 'react'
import Draggable from 'react-draggable'
import { X, Type, Image as ImageIcon } from 'lucide-react'

export default function DraggableElement({ element, isSelected, onSelect, onUpdate, onDelete, scale = 1 }) {
    const nodeRef = useRef(null)

    // Calculate position based on percentage coordinates
    // stored x/y are percentages (0-100)
    // We don't need to convert them here if we rely on controlled position, 
    // but Draggable works best with pixel deltas or controlled x/y.
    // For simplicity, we'll let Draggable manage its internal state but sync on stop.

    // NOTE: react-draggable uses px for x/y. 
    // We need the parent container dimensions to convert % <-> px.
    // But inside this component we might not know parent size easily unless passed.
    // A better pattern for a "visual editor" is to let the parent pass pixel values.

    const handleStop = (e, data) => {
        // Parent will convert px updates back to %/state
        onUpdate(element.id, { x: data.x, y: data.y })
    }

    return (
        <Draggable
            nodeRef={nodeRef}
            position={{ x: element.x, y: element.y }}
            onStop={handleStop}
            onStart={() => onSelect(element.id)}
            scale={scale}
        >
            <div
                ref={nodeRef}
                className={`absolute cursor-move group ${isSelected ? 'z-50' : 'z-10'}`}
                style={{ transformOrigin: 'top left' }}
                onClick={(e) => {
                    e.stopPropagation()
                    onSelect(element.id)
                }}
            >
                <div className={`relative ${isSelected ? 'ring-2 ring-blue-500 rounded border-blue-500' : 'hover:ring-1 hover:ring-blue-300 border-transparent'}`}>

                    {/* Delete handle (visible on select) */}
                    {isSelected && (
                        <button
                            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors z-50 pointer-events-auto"
                            onClick={(e) => {
                                e.stopPropagation()
                                onDelete(element.id)
                            }}
                            title="Remove"
                        >
                            <X size={12} />
                        </button>
                    )}

                    {/* Content */}
                    {element.type === 'text' ? (
                        <div
                            className="whitespace-nowrap px-2 py-1 min-w-[50px] min-h-[20px]"
                            style={{
                                fontSize: element.fontSize || 16,
                                color: element.color || '#000000',
                                fontFamily: 'Helvetica, Arial, sans-serif'
                            }}
                        >
                            {element.content}
                        </div>
                    ) : element.type === 'image' ? (
                        <div className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={element.content}
                                alt="Draggable"
                                className="pointer-events-none select-none"
                                style={{ width: element.width || 100, height: 'auto' }}
                            />
                        </div>
                    ) : element.type === 'rectangle' ? (
                        <div
                            className="pointer-events-none"
                            style={{
                                width: element.width || 100,
                                height: element.height || 50,
                                backgroundColor: element.color || 'black',
                                opacity: element.opacity || 1
                            }}
                        />
                    ) : null}

                </div>
            </div>
        </Draggable>
    )
}
