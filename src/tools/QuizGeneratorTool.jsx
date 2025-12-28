import React, { useState } from 'react'
import ToolLayout from '../components/common/ToolLayout'
import FileDropZone from '../components/common/FileDropZone'
import { Brain, Check, FileText, Download, Share2, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { triggerConfetti } from '../utils/confetti'

export default function QuizGeneratorTool() {
    const [file, setFile] = useState(null)
    const [generating, setGenerating] = useState(false)
    const [quiz, setQuiz] = useState(null)
    const [selectedAnswers, setSelectedAnswers] = useState({})
    const [score, setScore] = useState(null)

    const handleFileChange = (files) => {
        if (files[0]) {
            setFile(files[0])
            setQuiz(null)
            setScore(null)
            setSelectedAnswers({})
        }
    }

    const generateQuiz = async () => {
        setGenerating(true)
        // Simulate AI processing time
        await new Promise(r => setTimeout(r, 2000))

        // Mock Quiz Data extracted from "PDF"
        const mockQuiz = {
            title: `Quiz: ${file.name}`,
            questions: [
                {
                    id: 1,
                    text: "What is the primary focus of the document?",
                    options: ["Financial Analysis", "Historical Data", "Project Planning", "Scientific Research"],
                    correct: 2
                },
                {
                    id: 2,
                    text: "According to section 3, which metric is most critical?",
                    options: ["ROI", "KPI Velocity", "Customer Churn", "Net Promoter Score"],
                    correct: 0
                },
                {
                    id: 3,
                    text: "The conclusion suggests proceeding with which strategy?",
                    options: ["Wait and See", "Aggressive Expansion", "Cost Cutting", "Merger"],
                    correct: 1
                }
            ]
        }

        setQuiz(mockQuiz)
        setGenerating(false)
        triggerConfetti()
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
        <ToolLayout title="Quiz Generator" description="Turn any PDF into a study quiz instantly with AI.">
            <div className="max-w-4xl mx-auto">
                {!file ? (
                    <FileDropZone onFiles={handleFileChange} accept="application/pdf" hint="Upload lecture notes or textbook" />
                ) : (
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                        {/* Header */}
                        <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-100 p-2 rounded-xl text-purple-600">
                                    <Brain className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{file.name}</h3>
                                    <p className="text-xs text-slate-500">AI Knowledge Engine Ready</p>
                                </div>
                            </div>
                            <button onClick={() => setFile(null)} className="text-xs font-bold text-slate-400 hover:text-red-500">Change File</button>
                        </div>

                        <div className="p-8">
                            {!quiz ? (
                                <div className="text-center py-10">
                                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Ready to test your knowledge?</h3>
                                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
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
                                        <div key={q.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                            <h4 className="font-bold text-slate-800 text-lg mb-4 flex gap-3">
                                                <span className="bg-white text-slate-400 w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-sm">{qIdx + 1}</span>
                                                {q.text}
                                            </h4>

                                            <div className="space-y-3 pl-11">
                                                {q.options.map((opt, oIdx) => {
                                                    const isSelected = selectedAnswers[qIdx] === oIdx
                                                    const isCorrect = score && q.correct === oIdx
                                                    const isWrong = score && isSelected && q.correct !== oIdx

                                                    let className = "w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center "

                                                    if (score) {
                                                        if (isCorrect) className += "border-green-500 bg-green-50 text-green-700 font-bold"
                                                        else if (isWrong) className += "border-red-500 bg-red-50 text-red-700"
                                                        else className += "border-slate-200 opacity-50"
                                                    } else {
                                                        if (isSelected) className += "border-purple-500 bg-purple-50 text-purple-700 font-semibold"
                                                        else className += "border-slate-200 hover:border-purple-300 bg-white"
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
                                            <p className="text-slate-400 mb-6">{score.correct} out of {score.total} correct</p>

                                            <div className="flex justify-center gap-4">
                                                <button onClick={() => { setScore(null); setSelectedAnswers({}); }} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold">Retry Quiz</button>
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
