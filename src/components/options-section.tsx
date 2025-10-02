"use client"

import { useState } from "react"
import { ChevronDown, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { ProcessingStep } from "./ai-learning-assistant"

interface OptionsSectionProps {
  webSearchEnabled: boolean
  onWebSearchChange: (enabled: boolean) => void
  currentStep: ProcessingStep
  onStepChange: (step: ProcessingStep) => void
}

export function OptionsSection({
  webSearchEnabled,
  onWebSearchChange,
  currentStep,
  onStepChange,
}: OptionsSectionProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [generatePPT, setGeneratePPT] = useState(true)
  const [autoImages, setAutoImages] = useState(true)
  const [imageStyle, setImageStyle] = useState("academic")
  const [language, setLanguage] = useState("zh")
  const [summaryLevel, setSummaryLevel] = useState("both")
  const [quizCount, setQuizCount] = useState(10)

  const handleStartGeneration = () => {
    // 开始生成，模拟完整的进度流程
    onStepChange("parsing")
    setTimeout(() => onStepChange("indexing"), 2000)
    setTimeout(() => onStepChange("summary"), 4000)
    setTimeout(() => onStepChange("quiz"), 6000)
    setTimeout(() => onStepChange("images"), 8000)
    setTimeout(() => onStepChange("ppt"), 10000)
    setTimeout(() => onStepChange("complete"), 12000)
  }

  const handleSummaryOnly = () => {
    // 仅生成摘要
    onStepChange("parsing")
    setTimeout(() => onStepChange("indexing"), 1500)
    setTimeout(() => onStepChange("summary"), 3000)
    setTimeout(() => onStepChange("complete"), 4500)
  }

  const handleQuizOnly = () => {
    // 仅生成Quiz
    onStepChange("parsing")
    setTimeout(() => onStepChange("indexing"), 1500)
    setTimeout(() => onStepChange("summary"), 3000)
    setTimeout(() => onStepChange("quiz"), 4500)
    setTimeout(() => onStepChange("complete"), 6000)
  }

  const isProcessing = currentStep !== "idle" && currentStep !== "complete"
  const canStart = currentStep === "idle"

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">生成选项</CardTitle>
        <CardDescription>配置AI生成参数</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
          <div className="space-y-0.5">
            <Label htmlFor="web-search" className="font-medium">
              启用联网搜索
            </Label>
            <p className="text-sm text-muted-foreground">用于补充外部资料</p>
          </div>
          <Switch
            id="web-search"
            checked={webSearchEnabled}
            onCheckedChange={onWebSearchChange}
            disabled={isProcessing}
          />
        </div>

        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between bg-transparent">
              高级选项
              <ChevronDown className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4 rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="generate-ppt" className="font-medium">
                生成PPT
              </Label>
              <Switch
                id="generate-ppt"
                checked={generatePPT}
                onCheckedChange={setGeneratePPT}
                disabled={isProcessing}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto-images" className="font-medium">
                为PPT自动配图
              </Label>
              <Switch
                id="auto-images"
                checked={autoImages}
                onCheckedChange={setAutoImages}
                disabled={!generatePPT || isProcessing}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-medium">图片风格</Label>
              <Select value={imageStyle} onValueChange={setImageStyle} disabled={isProcessing}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">学术风格</SelectItem>
                  <SelectItem value="modern">现代风格</SelectItem>
                  <SelectItem value="minimal">简约风格</SelectItem>
                  <SelectItem value="colorful">彩色风格</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-medium">生成语言</Label>
              <Select value={language} onValueChange={setLanguage} disabled={isProcessing}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="both">中英双语</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-medium">摘要详细程度</Label>
              <Select value={summaryLevel} onValueChange={setSummaryLevel} disabled={isProcessing}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brief">简要摘要</SelectItem>
                  <SelectItem value="detailed">详细摘要</SelectItem>
                  <SelectItem value="both">简要+详细</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-medium">Quiz数量: {quizCount}</Label>
              <input
                type="range"
                min="5"
                max="20"
                value={quizCount}
                onChange={(e) => setQuizCount(Number(e.target.value))}
                disabled={isProcessing}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5</span>
                <span>20</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button 
            className="flex-1 shadow-sm" 
            size="lg" 
            onClick={handleStartGeneration} 
            disabled={!canStart}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isProcessing ? "生成中..." : "开始生成"}
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleSummaryOnly}
            disabled={!canStart}
          >
            仅生成摘要
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleQuizOnly}
            disabled={!canStart}
          >
            仅生成Quiz
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
