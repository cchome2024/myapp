"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles } from "lucide-react"

interface StreamingFeedbackProps {
  isActive: boolean
}

export function StreamingFeedback({ isActive }: StreamingFeedbackProps) {
  const [streamedText, setStreamedText] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)

  useEffect(() => {
    if (!isActive) {
      setIsStreaming(false)
      return
    }

    setIsStreaming(true)
    const fullText = `正在分析您上传的文档内容...

我已经识别到这是一份关于机器学习的教学材料，包含以下主要内容：

1. 机器学习基础概念
2. 监督学习算法详解
3. 无监督学习方法
4. 深度学习入门

现在我将为您生成：
✓ 结构化的章节摘要
✓ 针对性的测试题目
✓ 配套的可视化图表
✓ 完整的演示文稿

预计处理时间：约2-3分钟
请稍候，我会实时更新处理进度...`

    let index = 0
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setStreamedText(fullText.slice(0, index + 1))
        index++
      } else {
        setIsStreaming(false)
        clearInterval(interval)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [isActive])

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          AI 反馈
          {isStreaming && <span className="ml-2 h-2 w-2 animate-pulse rounded-full bg-primary" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48 rounded-lg border bg-muted/50 p-4">
          {streamedText ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{streamedText}</div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">等待开始处理...</div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
