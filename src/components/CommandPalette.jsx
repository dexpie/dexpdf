'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import {
    FileText, Search, Zap,
    Mic, MicOff, Clock, Star, Activity
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useVoiceCommands } from '@/hooks/useVoiceCommands'
import './CommandPalette.css'

export default function CommandPalette({ tools, isOpen, onClose }) {
    const router = useRouter()
    const { t } = useTranslation()
    const { isListening, transcript, startListening, supported } = useVoiceCommands()
    const [search, setSearch] = useState('')

    // Voice to Search binding
    useEffect(() => {
        if (transcript) setSearch(transcript)
    }, [transcript])

    // Toggle body scroll
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    const runCommand = (command) => {
        command()
        onClose()
    }

    // Navigation Helper
    const goTo = (path) => runCommand(() => router.push(path))

    return (
        <Command.Dialog
            open={isOpen}
            onOpenChange={onClose}
            label="Global Command Menu"
            className="cmdk-dialog"
        >
            <div className="cmdk-header">
                <Search className="w-5 h-5 text-slate-400 ml-4" />
                <Command.Input
                    placeholder={isListening ? "Listening..." : "Type a command or search..."}
                    className="cmdk-input"
                    value={search}
                    onValueChange={setSearch}
                />
                <button
                    onClick={startListening}
                    disabled={!supported}
                    className={`mr-4 p-2 rounded-full transition-all ${isListening ? 'bg-red-100 text-red-600' : 'hover:bg-slate-100 text-slate-400'}`}
                >
                    {isListening ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
                </button>
            </div>

            <Command.List className="cmdk-list">
                <Command.Empty className="cmdk-empty">
                    No results found.
                </Command.Empty>

                <Command.Group heading="Suggestions">
                    <Command.Item onSelect={() => goTo('/merge')} className="cmdk-item">
                        <Zap className="mr-2 w-4 h-4 text-yellow-500" />
                        Merge PDFs
                    </Command.Item>
                    <Command.Item onSelect={() => goTo('/invoice-generator')} className="cmdk-item">
                        <FileText className="mr-2 w-4 h-4 text-green-500" />
                        Create Invoice
                    </Command.Item>
                </Command.Group>

                <Command.Group heading="Tools">
                    {tools.map(tool => (
                        <Command.Item
                            key={tool.id}
                            onSelect={() => goTo(`/${tool.id}`)}
                            value={tool.name + " " + tool.desc} // Search against this
                            className="cmdk-item"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded flex items-center justify-center text-xs text-white font-bold bg-${tool.color}-500 opacity-80`}>
                                    {tool.name[0]}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium">{tool.name}</span>
                                    <span className="text-xs text-slate-400">{tool.desc}</span>
                                </div>
                            </div>
                        </Command.Item>
                    ))}
                </Command.Group>

                <Command.Group heading="System">
                    <Command.Item onSelect={() => goTo('/my-documents')} className="cmdk-item">
                        <Clock className="mr-2 w-4 h-4" />
                        Recent Documents
                    </Command.Item>
                    <Command.Item onSelect={() => window.open('https://github.com/dexpie/dexpdf', '_blank')} className="cmdk-item">
                        <Star className="mr-2 w-4 h-4" />
                        Star on GitHub
                    </Command.Item>
                    <Command.Item onSelect={() => runCommand(() => { })} className="cmdk-item">
                        <Activity className="mr-2 w-4 h-4" />
                        System Status: Online
                    </Command.Item>
                </Command.Group>

            </Command.List>

            <div className="cmdk-footer">
                <div className="flex gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><kbd>↵</kbd> select</span>
                    <span className="flex items-center gap-1"><kbd>↓</kbd> navigate</span>
                    <span className="flex items-center gap-1"><kbd>esc</kbd> close</span>
                </div>
            </div>
        </Command.Dialog>
    )
}
