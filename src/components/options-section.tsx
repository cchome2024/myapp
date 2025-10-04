"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Sparkles, RotateCcw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useToast } from "@/hooks/use-toast"
import { startProject, getStatus } from "@/lib/backend"
import type { ProcessingStep } from "./ai-learning-assistant"

interface OptionsSectionProps {
  webSearchEnabled: boolean
  onWebSearchChange: (enabled: boolean) => void
  currentStep: ProcessingStep
  onStepChange: (step: ProcessingStep) => void
  selectedProject?: string
}

export function OptionsSection({
  webSearchEnabled,
  onWebSearchChange,
  currentStep,
  onStepChange,
  selectedProject,
}: OptionsSectionProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [generatePPT, setGeneratePPT] = useState(true)
  const [autoImages, setAutoImages] = useState(true)
  const [imageStyle, setImageStyle] = useState("academic")
  const [language, setLanguage] = useState("zh")
  const [summaryLevel, setSummaryLevel] = useState("both")
  const [quizCount, setQuizCount] = useState(10)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // 清理轮询
  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  // 开始轮询状态
  const startPolling = async (projectId: string) => {
    const pollStatus = async () => {
      try {
        const status = await getStatus(projectId)
        console.log('Polling status:', status)
        
        // 更新进度
        setProgress(status.percent)
        onStepChange(status.step as ProcessingStep)
        
        if (status.status === 'complete') {
          setIsProcessing(false)
          stopPolling()
          toast({
            title: "生成完成",
            description: "项目生成成功完成",
          })
        } else if (status.status === 'error') {
          setIsProcessing(false)
          setError(status.lastError || '生成过程中发生错误')
          stopPolling()
          toast({
            title: "生成失败",
            description: status.lastError || '生成过程中发生错误',
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Polling error:', error)
        setIsProcessing(false)
        setError('获取状态失败')
        stopPolling()
        toast({
          title: "状态检查失败",
          description: "无法获取项目状态",
          variant: "destructive",
        })
      }
    }

    // 立即执行一次
    await pollStatus()
    
    // 开始轮询
    pollingRef.current = setInterval(pollStatus, 1200)
  }

  const handleStartGeneration = async () => {
    if (!selectedProject) {
      toast({
        title: "请先选择项目",
        description: "请先选择一个项目再开始生成",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)
      setError(null)
      setProgress(0)
      
      const config = {
        webSearchEnabled,
        generatePPT,
        autoImages,
        imageStyle: imageStyle as "academic" | "flat" | "realistic" | "wireframe",
        language: language as "zh" | "en",
        summaryLevel: summaryLevel as "chapter" | "global" | "both",
        quizCount
      }

      console.log('Starting project with config:', config)
      await startProject(selectedProject, config)
      
      // 开始轮询状态
      await startPolling(selectedProject)
      
      toast({
        title: "开始生成",
        description: "项目生成已开始，请稍候...",
      })
    } catch (error) {
      console.error('Start generation error:', error)
      setIsProcessing(false)
      setError('启动生成失败')
      toast({
        title: "启动失败",
        description: "无法启动项目生成",
        variant: "destructive",
      })
    }
  }

  const handleSummaryOnly = async () => {
    if (!selectedProject) {
      toast({
        title: "请先选择项目",
        description: "请先选择一个项目再开始生成",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)
      setError(null)
      setProgress(0)
      
      const config = {
        webSearchEnabled,
        generatePPT: false,
        autoImages: false,
        imageStyle: imageStyle as "academic" | "flat" | "realistic" | "wireframe",
        language: language as "zh" | "en",
        summaryLevel: summaryLevel as "chapter" | "global" | "both",
        quizCount: 0
      }

      await startProject(selectedProject, config)
      await startPolling(selectedProject)
      
      toast({
        title: "开始生成摘要",
        description: "摘要生成已开始，请稍候...",
      })
    } catch (error) {
      console.error('Start summary error:', error)
      setIsProcessing(false)
      setError('启动摘要生成失败')
      toast({
        title: "启动失败",
        description: "无法启动摘要生成",
        variant: "destructive",
      })
    }
  }

  const handleQuizOnly = async () => {
    if (!selectedProject) {
      toast({
        title: "请先选择项目",
        description: "请先选择一个项目再开始生成",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)
      setError(null)
      setProgress(0)
      
      const config = {
        webSearchEnabled,
        generatePPT: false,
        autoImages: false,
        imageStyle: imageStyle as "academic" | "flat" | "realistic" | "wireframe",
        language: language as "zh" | "en",
        summaryLevel: summaryLevel as "chapter" | "global" | "both",
        quizCount
      }

      await startProject(selectedProject, config)
      await startPolling(selectedProject)
      
      toast({
        title: "开始生成Quiz",
        description: "Quiz生成已开始，请稍候...",
      })
    } catch (error) {
      console.error('Start quiz error:', error)
      setIsProcessing(false)
      setError('启动Quiz生成失败')
      toast({
        title: "启动失败",
        description: "无法启动Quiz生成",
        variant: "destructive",
      })
    }
  }

  const handleRetry = () => {
    setError(null)
    handleStartGeneration()
  }

  // 清理轮询
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [])

  const canStart = !isProcessing && selectedProject

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

        {/* 错误显示 */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">生成失败</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RotateCcw className="mr-2 h-3 w-3" />
                重试
              </Button>
            </div>
          </div>
        )}

        {/* 进度显示 */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>生成进度</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

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
