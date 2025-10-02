"use client"

import { useState, useEffect } from "react"
import { Edit2, Check, X, Sparkles } from "lucide-react"
import { UploadSection } from "./upload-section"
import { OptionsSection } from "./options-section"
import { ProgressSection } from "./progress-section"
import { StreamingFeedback } from "./streaming-feedback"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ProcessingStep } from "./ai-learning-assistant"

interface WorkspaceProps {
  currentStep: ProcessingStep
  onStepChange: (step: ProcessingStep) => void
  webSearchEnabled: boolean
  onWebSearchChange: (enabled: boolean) => void
  projectName: string
  onProjectNameChange: (name: string) => void
  selectedProject?: string
}

export function Workspace({
  currentStep,
  onStepChange,
  webSearchEnabled,
  onWebSearchChange,
  projectName,
  onProjectNameChange,
  selectedProject,
}: WorkspaceProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(projectName)

  useEffect(() => {
    setEditedName(projectName)
  }, [projectName])

  const handleStartEdit = () => {
    setEditedName(projectName)
    setIsEditing(true)
  }

  const handleSave = () => {
    if (editedName.trim()) {
      onProjectNameChange(editedName.trim())
    } else {
      const generatedName = `学习项目 - ${new Date().toLocaleDateString("zh-CN")}`
      onProjectNameChange(generatedName)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedName(projectName)
    setIsEditing(false)
  }

  const handleAutoGenerate = () => {
    const topics = [
      "机器学习基础",
      "深度学习入门",
      "数据科学探索",
      "人工智能概论",
      "神经网络原理",
      "算法与数据结构",
      "Python编程实践",
      "Web开发进阶",
    ]
    const randomTopic = topics[Math.floor(Math.random() * topics.length)]
    setEditedName(randomTopic)
  }

  return (
    <main className="flex-1 overflow-auto bg-muted/30">
      <div className="mx-auto max-w-4xl space-y-5 p-8">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="输入项目名称..."
                  className="flex-1 text-lg font-semibold"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave()
                    if (e.key === "Escape") handleCancel()
                  }}
                />
                <Button size="icon" variant="ghost" onClick={handleAutoGenerate} title="AI 自动生成名称">
                  <Sparkles className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleSave}>
                  <Check className="h-4 w-4 text-emerald-600" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleCancel}>
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </>
            ) : (
              <>
                <h1 className="flex-1 text-lg font-semibold text-foreground">{projectName || "未命名项目"}</h1>
                <Button size="icon" variant="ghost" onClick={handleStartEdit}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <UploadSection selectedProject={selectedProject} />
        <OptionsSection
          webSearchEnabled={webSearchEnabled}
          onWebSearchChange={onWebSearchChange}
          currentStep={currentStep}
          onStepChange={onStepChange}
        />
        <StreamingFeedback isActive={currentStep !== "idle" && currentStep !== "complete"} />
        <ProgressSection currentStep={currentStep} />
      </div>
    </main>
  )
}
