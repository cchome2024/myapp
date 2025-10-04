"use client"

import { useState, useEffect } from "react"
import { Copy, Download, Share2, Eye, FileCode, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { ProcessingStep } from "../ai-learning-assistant"

interface ImagesTabProps {
  currentStep: ProcessingStep
  projectId?: string
}

interface ImageData {
  id: string
  url: string
  title: string
  description: string
  category: string
}

export function ImagesTab({ currentStep, projectId }: ImagesTabProps) {
  const [previewImage, setPreviewImage] = useState<ImageData | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(true)

  // 只要有projectId就尝试加载数据，不依赖currentStep
  useEffect(() => {
    if (!projectId) return

    const fetchImages = async () => {
      try {
        setLoading(true)
        console.log("ImagesTab: Fetching images for projectId:", projectId)
        const { getImages } = await import("@/lib/backend")
        const imagesData = await getImages(projectId)
        console.log("ImagesTab: Received images data:", imagesData)
        setImages(imagesData.items || [])
        console.log("ImagesTab: Set images count:", imagesData.items?.length || 0)
      } catch (error) {
        console.error("ImagesTab: Failed to fetch images:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [projectId])

  const handlePreview = (image: ImageData) => {
    setPreviewImage(image)
    setIsPreviewOpen(true)
  }

  const handleDownloadImage = (image: ImageData) => {
    const link = document.createElement("a")
    link.href = image.url
    link.download = `${image.title}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-32 h-24 bg-muted rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="h-3 w-2/3 rounded bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">暂无配图数据</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {images.map((image) => (
          <Card key={image.id} className="group hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-32 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="text-base font-semibold line-clamp-1">{image.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {image.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                        {image.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(image)}
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
                        <DropdownMenuItem onClick={() => handleDownloadImage(image)}>
                          <Download className="mr-2 h-4 w-4" />
                          下载图片
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
        ))}
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewImage?.title}</DialogTitle>
            <DialogDescription>{previewImage?.description}</DialogDescription>
          </DialogHeader>
          {previewImage && (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={previewImage.url}
                  alt={previewImage.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                  {previewImage.category}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
