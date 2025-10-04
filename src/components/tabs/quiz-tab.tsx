"use client"

import { useState, useEffect } from "react"
import { Copy, Download, Share2, Eye, FileCode, Loader2, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { ProcessingStep } from "../ai-learning-assistant"

interface QuizTabProps {
  currentStep: ProcessingStep
  projectId?: string
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizData {
  questions: QuizQuestion[]
}

export function QuizTab({ currentStep, projectId }: QuizTabProps) {
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({})
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(true)

  // 只要有projectId就尝试加载数据，不依赖currentStep
  useEffect(() => {
    if (!projectId) return

    const fetchQuiz = async () => {
      try {
        setLoading(true)
        const { getQuiz } = await import("@/lib/backend")
        const quizData = await getQuiz(projectId)
        setQuizData(quizData)
      } catch (error) {
        console.error("Failed to fetch quiz:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [projectId])

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const handleSubmit = () => {
    setShowResults(true)
  }

  const handleReset = () => {
    setSelectedAnswers({})
    setShowResults(false)
  }

  const getScore = () => {
    if (!quizData) return 0
    let correct = 0
    quizData.questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correct++
      }
    })
    return correct
  }

  const getScorePercentage = () => {
    if (!quizData) return 0
    return Math.round((getScore() / quizData.questions.length) * 100)
  }

  const isAnswerCorrect = (questionId: string, answerIndex: number) => {
    if (!quizData) return false
    const question = quizData.questions.find(q => q.id === questionId)
    if (!question) return false
    return answerIndex === question.correctAnswer
  }

  const isAnswerSelected = (questionId: string, answerIndex: number) => {
    return selectedAnswers[questionId] === answerIndex
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-3/4 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!quizData || quizData.questions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">暂无Quiz数据</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!showResults && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Quiz 测试</h3>
          <div className="text-sm text-muted-foreground">
            已选择 {Object.keys(selectedAnswers).length} / {quizData.questions.length} 题
          </div>
        </div>
      )}

      {showResults && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">
                {getScore()} / {quizData.questions.length}
              </div>
              <div className="text-sm text-muted-foreground">
                正确率: {getScorePercentage()}%
              </div>
              <div className="flex gap-2 justify-center mt-4">
                <Button onClick={handleReset} variant="outline">
                  重新测试
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {quizData.questions.map((question, index) => (
          <Card key={question.id} className="group hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">
                {index + 1}. {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={selectedAnswers[question.id]?.toString()}
                onValueChange={(value) => handleAnswerSelect(question.id, parseInt(value))}
                disabled={showResults}
              >
                {question.options.map((option, optionIndex) => {
                  const isSelected = isAnswerSelected(question.id, optionIndex)
                  const isCorrect = isAnswerCorrect(question.id, optionIndex)
                  const isWrong = showResults && isSelected && !isCorrect

                  return (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={optionIndex.toString()}
                        id={`${question.id}-${optionIndex}`}
                        className={showResults ? "pointer-events-none" : ""}
                      />
                      <Label
                        htmlFor={`${question.id}-${optionIndex}`}
                        className={`flex-1 cursor-pointer p-2 rounded-md transition-colors ${
                          showResults
                            ? isCorrect
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : isWrong
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-muted/50"
                            : isSelected
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        {option}
                        {showResults && isCorrect && (
                          <CheckCircle className="inline-block ml-2 h-4 w-4 text-green-600" />
                        )}
                        {showResults && isWrong && (
                          <XCircle className="inline-block ml-2 h-4 w-4 text-red-600" />
                        )}
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>

              {showResults && (
                <div className="mt-4 p-3 bg-muted/50 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    <strong>解释:</strong> {question.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!showResults && (
        <div className="flex gap-2">
          <Button onClick={handleSubmit} className="flex-1">
            提交答案
          </Button>
        </div>
      )}
    </div>
  )
}
