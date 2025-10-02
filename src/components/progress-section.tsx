"use client"

import { useState } from "react"
import { ChevronDown, CheckCircle2, Circle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { ProcessingStep } from "./ai-learning-assistant"

interface ProgressSectionProps {
  currentStep: ProcessingStep
}

const steps = [
  { id: "parsing", label: "解析" },
  { id: "indexing", label: "索引" },
  { id: "summary", label: "生成摘要" },
  { id: "quiz", label: "生成Quiz" },
  { id: "images", label: "生成配图" },
  { id: "ppt", label: "生成PPT" },
  { id: "complete", label: "完成" },
]

const mockLogs: { [key: string]: { time: string; message: string }[] } = {
  parsing: [
    { time: "14:32:01", message: "开始解析文档..." },
    { time: "14:32:03", message: "文档解析完成，共识别 45 页内容" },
  ],
  indexing: [
    { time: "14:32:04", message: "开始建立索引..." },
    { time: "14:32:06", message: "索引建立完成" },
  ],
  summary: [
    { time: "14:32:07", message: "开始生成摘要..." },
    { time: "14:32:15", message: "摘要生成完成" },
  ],
  quiz: [
    { time: "14:32:16", message: "开始生成Quiz题目..." },
    { time: "14:32:22", message: "Quiz题目生成完成" },
  ],
  images: [
    { time: "14:32:23", message: "开始生成配图..." },
    { time: "14:32:30", message: "配图生成完成" },
  ],
  ppt: [
    { time: "14:32:31", message: "开始生成PPT..." },
    { time: "14:32:40", message: "PPT生成完成" },
  ],
  complete: [
    { time: "14:32:41", message: "所有任务完成！" },
  ],
}

export function ProgressSection({ currentStep }: ProgressSectionProps) {
  const [logsOpen, setLogsOpen] = useState(false)

  if (currentStep === "idle") return null

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)
  const displayedLogs = mockLogs[currentStep] || []

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">处理进度</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          {steps.map((step, index) => {
            const isComplete = index < currentStepIndex
            const isCurrent = index === currentStepIndex
            const isLast = index === steps.length - 1
            const isCompleteStep = step.id === "complete" && isCurrent

            return (
              <div key={step.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all",
                      (isComplete || isCompleteStep) && "border-primary bg-primary text-primary-foreground shadow-sm",
                      isCurrent && !isCompleteStep && "border-primary bg-primary/10 text-primary shadow-sm",
                      !isComplete && !isCurrent && "border-border bg-background text-muted-foreground",
                    )}
                  >
                    {isComplete || isCompleteStep ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                  </div>
                  <span className={cn("text-xs text-center font-medium", isCurrent && "text-primary")}>
                    {step.label}
                  </span>
                </div>
                {!isLast && (
                  <div className={cn("h-0.5 flex-1 transition-all", isComplete ? "bg-primary" : "bg-border")} />
                )}
              </div>
            )
          })}
        </div>

        <Collapsible open={logsOpen} onOpenChange={setLogsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between bg-transparent">
              实时日志
              <ChevronDown className={`h-4 w-4 transition-transform ${logsOpen ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <ScrollArea className="h-40 rounded-lg border bg-muted/50 p-4 shadow-inner">
              <div className="space-y-2 font-mono text-xs">
                {displayedLogs.map((log, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="text-muted-foreground">[{log.time}]</span>
                    <span className="text-foreground">{log.message}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
