"use client"

import { useState, useEffect } from "react"
import { Copy, Download, Share2, Eye, FileCode, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { ProcessingStep } from "../ai-learning-assistant"

interface SummaryTabProps {
  currentStep: ProcessingStep
  projectId?: string
}

import type { SummaryData } from "@/lib/backend"

interface ProjectData {
  id: string
  name: string
  date: string
  status: string
  description?: string
  uploadedFiles?: string
  customContent?: string
  sourceUrls?: string
  tags?: string[]
}

export function SummaryTab({ currentStep, projectId }: SummaryTabProps) {
  const [previewHtml, setPreviewHtml] = useState<string>("")
  const [previewTitle, setPreviewTitle] = useState<string>("")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)

  // 只要有projectId就尝试加载数据，不依赖currentStep
  useEffect(() => {
    if (!projectId) return

    const fetchSummaryAndProject = async () => {
      try {
        setLoading(true)
        // Fetch project data
        const { getProjects } = await import("@/lib/backend")
        const projectsResult = await getProjects()
        const project = projectsResult.data?.find((p: any) => p.id === projectId)
        if (project) {
          setProjectData(project)
        }

        // Fetch summary data
        const { getSummary } = await import("@/lib/backend")
        const summaryData = await getSummary(projectId)
        setSummaryData(summaryData)
      } catch (error) {
        console.error("Failed to fetch summary or project data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSummaryAndProject()
  }, [projectId])

  const getSummaryTitle = () => {
    if (projectData?.name) {
      return `${projectData.name} - 学习摘要`
    }
    if (summaryData?.text) {
      const firstLine = summaryData.text.split('\n')[0]
      if (firstLine.startsWith('# ')) {
        return firstLine.substring(2).trim() + " - 学习摘要"
      }
    }
    return "学习摘要"
  }

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text)
    // Optionally, show a toast notification
  }

  const handleDownloadMarkdown = (text: string) => {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "summary.md"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handlePreview = (html: string, title: string) => {
    setPreviewHtml(html)
    setPreviewTitle(title)
    setIsPreviewOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-32 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!summaryData) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">暂无摘要数据</p>
      </div>
    )
  }

  return (
    <>
      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text">文字版摘要</TabsTrigger>
          <TabsTrigger value="html">卡片式摘要</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{getSummaryTitle()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div
                  className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: summaryData.text.replace(/\n/g, "<br/>") }}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleCopyText(summaryData.text)}>
                  <Copy className="mr-2 h-3 w-3" />
                  复制
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Share2 className="mr-2 h-3 w-3" />
                      更多
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => handleDownloadMarkdown(summaryData.text)}>
                      <Download className="mr-2 h-4 w-4" />
                      下载为 Markdown
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePreview(summaryData.html, getSummaryTitle())}>
                      <Eye className="mr-2 h-4 w-4" />
                      预览 HTML
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="html" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{getSummaryTitle()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div
                  className="text-sm leading-relaxed text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: summaryData.html }}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleCopyText(summaryData.html)}>
                  <Copy className="mr-2 h-3 w-3" />
                  复制 HTML
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Share2 className="mr-2 h-3 w-3" />
                      更多
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => handlePreview(summaryData.html, getSummaryTitle())}>
                      <Eye className="mr-2 h-4 w-4" />
                      预览 HTML
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewTitle}</DialogTitle>
            <DialogDescription>摘要 HTML 预览</DialogDescription>
          </DialogHeader>
          <div
            className="prose prose-sm max-w-none dark:prose-invert overflow-auto max-h-[70vh]"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
          <div className="flex justify-end">
            <Button onClick={() => setIsPreviewOpen(false)}>关闭</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
