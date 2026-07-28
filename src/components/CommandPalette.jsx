'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import {
    FileText, Search, Zap,
    Mic, MicOff, Clock, Star, Activity
} from 'lucide-react'
import { useVoiceCommands } from '@/hooks/useVoiceCommands'
import './CommandPalette.css'

const CATEGORY_ACCENTS = {
    organize: 'bg-blue-100 text-blue-700',
    convert: 'bg-cyan-100 text-cyan-700',
    security: 'bg-emerald-100 text-emerald-700',
    create: 'bg-blue-100 text-blue-700',
}

export default function CommandPalette({ tools, isOpen, onClose }) {
    const router = useRouter()
    const { isListening, transcript, startListening, supported } = useVoiceCommands()
    const [search, setSearch] = useState('')

    useEffect(() => {
        if (transcript) setSearch(transcript)
    }, [transcript])

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    const runCommand = (command) => {
        command()
        onClose()
    }

    const goTo = (path) => runCommand(() => router.push(path))

    return (
        <Command.Dialog
            open={isOpen}
            onOpenChange={onClose}
            label="Global Command Menu"
            className="cmdk-dialog"
        >
            <div className="cmdk-header">
                <Search className="ml-4 h-5 w-5 text-muted-foreground" />
                <Command.Input
                    placeholder={isListening ? 'Listening...' : 'Type a command or search...'}
                    className="cmdk-input"
                    value={search}
                    onValueChange={setSearch}
                />
                <button
                    onClick={startListening}
                    disabled={!supported}
                    className={`mr-4 rounded-full p-2 transition-all ${isListening ? 'bg-red-100 text-red-600' : 'text-muted-foreground hover:bg-secondary'}`}
                >
                    {isListening ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
                </button>
            </div>

            <Command.List className="cmdk-list">
                <Command.Empty className="cmdk-empty">
                    No results found.
                </Command.Empty>

                <Command.Group heading="Suggestions">
                    <Command.Item onSelect={() => goTo('/merge')} className="cmdk-item">
                        <Zap className="mr-2 h-4 w-4 text-yellow-500" />
                        Merge PDFs
                    </Command.Item>
                    <Command.Item onSelect={() => goTo('/qr-code')} className="cmdk-item">
                        <FileText className="mr-2 h-4 w-4 text-blue-600" />
                        Open QR Code Studio
                    </Command.Item>
                </Command.Group>

                <Command.Group heading="Tools">
                    {tools.map(tool => (
                        <Command.Item
                            key={tool.id}
                            onSelect={() => goTo(tool.href || `/${tool.id}`)}
                            value={`${tool.name} ${tool.desc} ${tool.category}`}
                            className="cmdk-item"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${CATEGORY_ACCENTS[tool.category] || 'bg-slate-100 text-slate-700'}`}>
                                    {tool.name[0]}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium">{tool.name}</span>
                                    <span className="text-xs text-muted-foreground">{tool.desc}</span>
                                </div>
                            </div>
                        </Command.Item>
                    ))}
                </Command.Group>

                <Command.Group heading="System">
                    <Command.Item onSelect={() => goTo('/my-documents')} className="cmdk-item">
                        <Clock className="mr-2 h-4 w-4" />
                        Recent Documents
                    </Command.Item>
                    <Command.Item onSelect={() => window.open('https://github.com/dexpie/dexpdf', '_blank')} className="cmdk-item">
                        <Star className="mr-2 h-4 w-4" />
                        Star on GitHub
                    </Command.Item>
                    <Command.Item onSelect={() => runCommand(() => { })} className="cmdk-item">
                        <Activity className="mr-2 h-4 w-4" />
                        System Status: Online
                    </Command.Item>
                </Command.Group>
            </Command.List>

            <div className="cmdk-footer">
                <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><kbd>Enter</kbd> select</span>
                    <span className="flex items-center gap-1"><kbd>↓</kbd> navigate</span>
                    <span className="flex items-center gap-1"><kbd>esc</kbd> close</span>
                </div>
            </div>
        </Command.Dialog>
    )
}
