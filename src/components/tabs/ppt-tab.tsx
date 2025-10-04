"use client"

import { useState, useEffect } from "react"
import { Copy, Download, Share2, Eye, FileCode, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { ProcessingStep } from "../ai-learning-assistant"

interface PPTTabProps {
  currentStep: ProcessingStep
  projectId?: string
}

interface SlideData {
  id: string
  title: string
  content: string
  thumbnail: string
  order?: number
}

export function PPTTab({ currentStep, projectId }: PPTTabProps) {
  const [previewSlide, setPreviewSlide] = useState<SlideData | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [slides, setSlides] = useState<SlideData[]>([])
  const [loading, setLoading] = useState(true)

  // 只要有projectId就尝试加载数据，不依赖currentStep
  useEffect(() => {
    if (!projectId) return

    const fetchSlides = async () => {
      try {
        setLoading(true)
        console.log("PPTTab: Fetching slides for projectId:", projectId)
        const { getSlides } = await import("@/lib/backend")
        const slidesData = await getSlides(projectId)
        console.log("PPTTab: Setting slides:", slidesData)
        setSlides(slidesData.slides || [])
      } catch (error) {
        console.error("PPTTab: Failed to fetch slides:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSlides()
  }, [projectId])

  const handlePreview = (slide: SlideData) => {
    setPreviewSlide(slide)
    setIsPreviewOpen(true)
  }

  const handleDownloadSlide = (slide: SlideData) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${slide.title}</title>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            background: #f5f5f5; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .slide { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
          }
          .slide-image { 
            width: 100%; 
            height: 300px; 
            object-fit: cover; 
          }
          .slide-content { 
            padding: 30px; 
          }
          .slide-title { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 20px; 
            color: #333; 
          }
          .slide-text { 
            font-size: 16px; 
            line-height: 1.6; 
            color: #666; 
          }
        </style>
      </head>
      <body>
        <div class="slide">
          <img src="${slide.thumbnail}" alt="${slide.title}" class="slide-image">
          <div class="slide-content">
            <h1 class="slide-title">${slide.title}</h1>
            <p class="slide-text">${slide.content}</p>
          </div>
        </div>
      </body>
      </html>
    `
    
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slide.title}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">加载PPT数据中...</span>
      </div>
    )
  }

  if (!slides || slides.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">暂无PPT数据</p>
      </div>
    )
  }

  console.log("PPTTab: Rendering slides:", slides)

  return (
    <>
      <div className="space-y-4">
        {slides.map((slide) => {
          console.log("PPTTab: Rendering slide:", slide)
          return (
            <Card key={slide.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-48 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {slide.thumbnail ? (
                      <img
                        src={slide.thumbnail}
                        alt={slide.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          console.error("Image load error:", e)
                          console.error("Failed to load image:", slide.thumbnail)
                        }}
                        onLoad={() => {
                          console.log("Image loaded successfully:", slide.thumbnail)
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                        <FileCode className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold line-clamp-2">{slide.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 mt-1">
                        {slide.content}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(slide)}
                      >
                        <Eye className="mr-2 h-3 w-3" />
                        预览
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-3 w-3" />
                            更多
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => handleDownloadSlide(slide)}>
                            <Download className="mr-2 h-4 w-4" />
                            下载为 HTML
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            下载为 PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="mr-2 h-4 w-4" />
                            分享
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewSlide?.title}</DialogTitle>
            <DialogDescription>幻灯片预览</DialogDescription>
          </DialogHeader>
          {previewSlide && (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                {previewSlide.thumbnail ? (
                  <img
                    src={previewSlide.thumbnail}
                    alt={previewSlide.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                    <FileCode className="h-16 w-16" />
                  </div>
                )}
              </div>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {previewSlide.content}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
