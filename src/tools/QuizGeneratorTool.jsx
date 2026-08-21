import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { Brain, Check, FileText, Download, Share2, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { triggerConfetti } from '../utils/confetti'
import * as pdfjsLib from 'pdfjs-dist'
import { configurePdfWorker } from '../utils/pdfWorker'
import { getStoredApiKey, setStoredApiKey, generateJSON } from '../services/gemini'

configurePdfWorker()

const ApiKeyModal = ({ onSave, onClose }) => {
    const [input, setInput] = useState('')
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-border dark:border-slate-700">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Brain className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground dark:text-slate-200">Enable AI Intelligence</h3>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-2">
                        To generate smart quizzes from your documents, please enter your free Google Gemini API Key.
                    </p>
                </div>
                <input
                    type="password"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Enter Gemini API Key"
                    className="w-full p-3 rounded-xl border border-border dark:border-slate-600 bg-secondary dark:bg-slate-900 text-foreground dark:text-slate-200 mb-4 focus:ring-2 ring-purple-500 outline-none"
                />
                <button
                    onClick={() => { if (input) onSave(input) }}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all"
                >
                    Save & Continue
                </button>
                <div className="mt-4 text-center">
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                        Get a free API Key here
                    </a>
                </div>
            </div>
        </div>
    )
}

export default function QuizGeneratorTool() {
    const [file, setFile] = useState(null)
    const [generating, setGenerating] = useState(false)
    const [quiz, setQuiz] = useState(null)
    const [selectedAnswers, setSelectedAnswers] = useState({})
    const [score, setScore] = useState(null)
    const [apiKey, setApiKey] = useState('')
    const [showKeyModal, setShowKeyModal] = useState(false)

    React.useEffect(() => {
        const key = getStoredApiKey()
        if (key) setApiKey(key)
    }, [])

    const handleSaveKey = (key) => {
        setStoredApiKey(key)
        setApiKey(key)
        setShowKeyModal(false)
    }

    const handleFileChange = (files) => {
        if (files[0]) {
            setFile(files[0])
            setQuiz(null)
            setScore(null)
            setSelectedAnswers({})
        }
    }

    const generateQuiz = async () => {
        if (!apiKey) {
            setShowKeyModal(true)
            return
        }

        setGenerating(true)
        try {
            // 1. Extract Text
            const buffer = await file.arrayBuffer()
            const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
            let fullText = ''
            const maxPages = Math.min(pdf.numPages, 10) // Limit to 10 pages for speed
            for (let i = 1; i <= maxPages; i++) {
                const page = await pdf.getPage(i)
                const textContent = await page.getTextContent()
                const pageText = textContent.items.map(item => item.str).join(' ')
                fullText += pageText + '\n'
            }

            // 2. Generate Quiz with Gemini
            const prompt = `
            You are a teacher. Create a multiple choice quiz based on the following text.
            Text Content: """${fullText.slice(0, 50000)}"""

            Output a JSON object with this exact structure:
            {
                "title": "A short title for the quiz",
                "questions": [
                    {
                        "id": 1,
                        "text": "Question text here?",
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "correct": 0 // index of correct option (0-3)
                    }
                ]
            }
            Create 5 challenging questions.
            `

            const json = await generateJSON(apiKey, prompt)
            setQuiz(json)
            triggerConfetti()

        } catch (error) {
            console.error("Quiz Generation Error:", error)
            alert("Failed to generate quiz. Please check your API usage or try a different file.")
            if (error.message?.includes('400') || error.message?.includes('401')) {
                setStoredApiKey('')
                setApiKey('')
            }
        } finally {
            setGenerating(false)
        }
    }

    const checkAnswers = () => {
        let correctCount = 0
        quiz.questions.forEach((q, i) => {
            if (selectedAnswers[i] === q.correct) correctCount++
        })
        setScore({ correct: correctCount, total: quiz.questions.length })
        if (correctCount === quiz.questions.length) triggerConfetti()
    }


    return (
        <ToolLayout title="Quiz Generator" description="Turn any PDF into a study quiz instantly with various AI models">
            <AnimatePresence>
                {showKeyModal && <ApiKeyModal onSave={handleSaveKey} onClose={() => setShowKeyModal(false)} />}
            </AnimatePresence>
            <div className="max-w-4xl mx-auto">
                {!file ? (
                    <FileDropZone onFiles={handleFileChange} accept="application/pdf" hint="Upload lecture notes or textbook" />
                ) : (
                    <div className="bg-card dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-border dark:border-slate-700">
                        {/* Header */}
                        <div className="bg-secondary dark:bg-slate-900 p-6 border-b border-border dark:border-slate-700 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-100 p-2 rounded-xl text-purple-600">
                                    <Brain className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground dark:text-slate-200">{file.name}</h3>
                                    <p className="text-xs text-muted-foreground dark:text-muted-foreground">AI Knowledge Engine Ready</p>
                                </div>
                            </div>
                            <button onClick={() => setFile(null)} className="text-xs font-bold text-muted-foreground hover:text-red-500">Change File</button>
                        </div>

                        <div className="p-8">
                            {!quiz ? (
                                <div className="text-center py-10">
                                    <h3 className="text-2xl font-bold text-foreground dark:text-slate-200 mb-4">Ready to test your knowledge?</h3>
                                    <p className="text-muted-foreground dark:text-muted-foreground mb-8 max-w-md mx-auto">
                                        Our AI will analyze the document and generate multiple choice questions to help you study.
                                    </p>
                                    <button
                                        onClick={generateQuiz}
                                        disabled={generating}
                                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/30 hover:scale-105 transition-all disabled:opacity-70"
                                    >
                                        {generating ? (
                                            <span className="flex items-center gap-2">
                                                <RefreshCw className="w-5 h-5 animate-spin" /> Generating...
                                            </span>
                                        ) : (
                                            "Generate Quiz"
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {quiz.questions.map((q, qIdx) => (
                                        <div key={q.id} className="bg-secondary dark:bg-slate-900 rounded-2xl p-6 border border-border dark:border-slate-700">
                                            <h4 className="font-bold text-foreground dark:text-slate-200 text-lg mb-4 flex gap-3">
                                                <span className="bg-card dark:bg-slate-800 text-muted-foreground dark:text-muted-foreground w-8 h-8 rounded-lg flex items-center justify-center border border-border dark:border-slate-700 text-sm">{qIdx + 1}</span>
                                                {q.text}
                                            </h4>

                                            <div className="space-y-3 pl-11">
                                                {q.options.map((opt, oIdx) => {
                                                    const isSelected = selectedAnswers[qIdx] === oIdx
                                                    const isCorrect = score && q.correct === oIdx
                                                    const isWrong = score && isSelected && q.correct !== oIdx

                                                    let className = "w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center "

                                                    if (score) {
                                                        if (isCorrect) className += "border-green-500 bg-emerald-500/10 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold"
                                                        else if (isWrong) className += "border-red-500 bg-destructive/10 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                                                        else className += "border-border dark:border-slate-700 opacity-50 dark:opacity-40 text-muted-foreground dark:text-muted-foreground"
                                                    } else {
                                                        if (isSelected) className += "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-semibold"
                                                        else className += "border-border dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-500/50 bg-card dark:bg-slate-800 text-foreground dark:text-muted-foreground"
                                                    }

                                                    return (
                                                        <button
                                                            key={oIdx}
                                                            onClick={() => !score && setSelectedAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                                                            className={className}
                                                            disabled={!!score}
                                                        >
                                                            <span>{opt}</span>
                                                            {isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                                                            {isWrong && <X className="w-5 h-5 text-red-600" />}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}

                                    {!score ? (
                                        <button
                                            onClick={checkAnswers}
                                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 shadow-xl"
                                        >
                                            Submit Answers
                                        </button>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-slate-900 text-white p-8 rounded-3xl text-center"
                                        >
                                            <h3 className="text-3xl font-bold mb-2">You Scored {Math.round((score.correct / score.total) * 100)}%</h3>
                                            <p className="text-muted-foreground mb-6">{score.correct} out of {score.total} correct</p>

                                            <div className="flex justify-center gap-4">
                                                <button onClick={() => { setScore(null); setSelectedAnswers({}); }} className="px-6 py-3 bg-card/10 hover:bg-card/20 rounded-xl font-bold">Retry Quiz</button>
                                                <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold flex items-center gap-2"><Download className="w-4 h-4" /> Save Results</button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    )
}
import { X, CheckCircle } from 'lucide-react'
