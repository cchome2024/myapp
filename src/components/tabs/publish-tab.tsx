"use client"

import { useState, useEffect } from "react"
import { 
  Download, 
  Share2, 
  Eye, 
  Loader2, 
  ExternalLink, 
  Settings, 
  Plus, 
  X, 
  Upload,
  Wand2,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ProcessingStep } from "../ai-learning-assistant"

interface PublishTabProps {
  currentStep: ProcessingStep
  projectId?: string
}

import type { SummaryData } from "@/lib/backend"

interface ImageData {
  id: string
  url: string
  title: string
  description: string
  category: string
}

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

interface PlatformConfig {
  id: string
  name: string
  icon: string
  color: string
  configured: boolean
  appId?: string
  appSecret?: string
}

interface PublishContent {
  title: string
  content: string
  tags: string[]
  coverImage?: string
  contentImages: string[]
}

type PublishStatus = "idle" | "configuring" | "previewing" | "publishing" | "success" | "error"

export function PublishTab({ currentStep, projectId }: PublishTabProps) {
  const [loading, setLoading] = useState(true)
  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
  const [projectImages, setProjectImages] = useState<ImageData[]>([])
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [publishStatus, setPublishStatus] = useState<PublishStatus>("idle")
  const [configForm, setConfigForm] = useState({ appId: "", appSecret: "" })
  const [publishContent, setPublishContent] = useState<PublishContent>({
    title: "",
    content: "",
    tags: [],
    contentImages: []
  })

  const [platformConfigs, setPlatformConfigs] = useState<PlatformConfig[]>([
    {
      id: "xiaohongshu",
      name: "小红书",
      icon: "",
      color: "bg-pink-500",
      configured: false
    },
    {
      id: "weibo",
      name: "微博",
      icon: "",
      color: "bg-red-500",
      configured: false
    },
    {
      id: "zhihu",
      name: "知乎",
      icon: "",
      color: "bg-blue-500",
      configured: false
    }
  ])

  // 只要有projectId就尝试加载数据，不依赖currentStep
  useEffect(() => {
    if (!projectId) return

    const fetchData = async () => {
      try {
        setLoading(true)
        
        // 获取项目数据
        const { getProjects } = await import("@/lib/backend")
        const projectsResult = await getProjects()
        const project = projectsResult.data?.find((p: any) => p.id === projectId)
        if (project) {
          setProjectData(project)
        }

        // 获取摘要数据
        const { getSummary } = await import("@/lib/backend")
        const summaryData = await getSummary(projectId)
        setSummaryData(summaryData)

        // 获取图片数据
        const { getImages } = await import("@/lib/backend")
        const imagesData = await getImages(projectId)
        setProjectImages(imagesData.items || [])
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [projectId])

  // 初始化发布内容
  useEffect(() => {
    if (projectData && summaryData) {
      setPublishContent({
        title: projectData.name || "学习笔记分享",
        content: summaryData.text || "",
        tags: projectData.tags || ["学习", "笔记"],
        contentImages: []
      })
    }
  }, [projectData, summaryData])

  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatform(platformId)
    const platform = platformConfigs.find(p => p.id === platformId)
    if (platform?.configured) {
      setPublishStatus("previewing")
      setIsPreviewDialogOpen(true)
    } else {
      setPublishStatus("configuring")
      setIsConfigDialogOpen(true)
    }
  }

  const handleConfigSave = () => {
    if (!selectedPlatform || !configForm.appId || !configForm.appSecret) return

    setPlatformConfigs(prev => 
      prev.map(p => 
        p.id === selectedPlatform 
          ? { ...p, configured: true, appId: configForm.appId, appSecret: configForm.appSecret }
          : p
      )
    )
    
    setIsConfigDialogOpen(false)
    setPublishStatus("previewing")
    setIsPreviewDialogOpen(true)
  }

  const handlePublish = async () => {
    setPublishStatus("publishing")
    
    // 模拟发布过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setPublishStatus("success")
    setTimeout(() => {
      setPublishStatus("idle")
      setIsPreviewDialogOpen(false)
    }, 2000)
  }

  const handleGenerateCover = () => {
    const coverImages = [
      "/xiaohongshu-style-cover-with-blue-and-purple-gradi.jpg",
      "/xiaohongshu-style-cover-with-gradient-pink-and-ora.jpg",
      "/xiaohongshu-style-cover-with-warm-colors--study-no.jpg"
    ]
    const randomCover = coverImages[Math.floor(Math.random() * coverImages.length)]
    setPublishContent(prev => ({ ...prev, coverImage: randomCover }))
  }

  const handleGenerateContentImages = () => {
    const contentImages = projectImages.slice(0, 6).map(img => img.url)
    setPublishContent(prev => ({ ...prev, contentImages }))
  }

  const handleAddTag = (tag: string) => {
    if (tag && !publishContent.tags.includes(tag)) {
      setPublishContent(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setPublishContent(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // 删除封面图片
  const handleRemoveCover = () => {
    setPublishContent(prev => ({ ...prev, coverImage: undefined }))
  }

  // 删除内容图片
  const handleRemoveContentImage = (index: number) => {
    setPublishContent(prev => ({
      ...prev,
      contentImages: prev.contentImages.filter((_, i) => i !== index)
    }))
  }

  // 上传封面图片
  const handleUploadCover = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPublishContent(prev => ({ 
            ...prev, 
            coverImage: e.target?.result as string 
          }))
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  // 上传内容图片
  const handleUploadContentImages = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.multiple = true
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      if (files.length > 0) {
        const newImages: string[] = []
        let loadedCount = 0
        
        files.forEach((file) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            newImages.push(e.target?.result as string)
            loadedCount++
            
            if (loadedCount === files.length) {
              setPublishContent(prev => ({
                ...prev,
                contentImages: [...prev.contentImages, ...newImages].slice(0, 9)
              }))
            }
          }
          reader.readAsDataURL(file)
        })
      }
    }
    input.click()
  }

  const getStatusIcon = (status: PublishStatus) => {
    switch (status) {
      case "idle":
        return <Play className="h-4 w-4" />
      case "configuring":
        return <Settings className="h-4 w-4" />
      case "previewing":
        return <Eye className="h-4 w-4" />
      case "publishing":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-32 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-2/3 rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!projectData) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">暂无项目数据</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">发布到社交媒体</h3>
          <Badge variant="outline">
            {publishStatus === "idle" && "准备就绪"}
            {publishStatus === "configuring" && "配置中"}
            {publishStatus === "previewing" && "预览中"}
            {publishStatus === "publishing" && "发布中"}
            {publishStatus === "success" && "发布成功"}
            {publishStatus === "error" && "发布失败"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {platformConfigs.map((platform) => (
            <Card
              key={platform.id}
              className={`cursor-pointer transition-all hover:shadow-md ${selectedPlatform === platform.id ? "ring-2 ring-primary" : ""}`}
              onClick={() => handlePlatformSelect(platform.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg ${platform.color} flex items-center justify-center text-white text-xl`}>
                      {platform.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base">{platform.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {platform.configured ? "已配置" : "未配置"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {platform.configured ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant={platform.configured ? "default" : "outline"}
                  className="w-full"
                  disabled={publishStatus === "publishing"}
                >
                  {platform.configured ? "发布内容" : "配置账号"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 配置对话框 */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>配置 {platformConfigs.find(p => p.id === selectedPlatform)?.name} 账号</DialogTitle>
            <DialogDescription>
              请输入您的应用凭据以启用发布功能
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="appId">App ID</Label>
              <Input
                id="appId"
                value={configForm.appId}
                onChange={(e) => setConfigForm(prev => ({ ...prev, appId: e.target.value }))}
                placeholder="请输入 App ID"
              />
            </div>
            <div>
              <Label htmlFor="appSecret">App Secret</Label>
              <Input
                id="appSecret"
                type="password"
                value={configForm.appSecret}
                onChange={(e) => setConfigForm(prev => ({ ...prev, appSecret: e.target.value }))}
                placeholder="请输入 App Secret"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleConfigSave} disabled={!configForm.appId || !configForm.appSecret}>
              保存配置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 预览对话框 */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>发布内容预览</DialogTitle>
            <DialogDescription>
              预览并编辑您要发布的内容
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">内容编辑</TabsTrigger>
              <TabsTrigger value="images">图片管理</TabsTrigger>
              <TabsTrigger value="preview">预览效果</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div>
                <Label htmlFor="title">标题</Label>
                <Input
                  id="title"
                  value={publishContent.title}
                  onChange={(e) => setPublishContent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="请输入标题"
                />
              </div>
              
              <div>
                <Label htmlFor="content">内容</Label>
                <Textarea
                  id="content"
                  value={publishContent.content}
                  onChange={(e) => setPublishContent(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="请输入内容"
                  rows={6}
                />
              </div>

              <div>
                <Label>标签</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {publishContent.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      #{tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                  <Input
                    placeholder="添加标签"
                    className="w-24"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddTag(e.currentTarget.value)
                        e.currentTarget.value = ""
                      }
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <div>
                <Label>封面图片</Label>
                <div className="mt-2 space-y-2">
                  <div className="aspect-[3/4] w-32 bg-muted rounded-lg overflow-hidden relative">
                    {publishContent.coverImage ? (
                      <>
                        <img 
                          src={publishContent.coverImage} 
                          alt="封面" 
                          className="w-full h-full object-cover"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={handleRemoveCover}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        无封面
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleGenerateCover}>
                      <Wand2 className="h-4 w-4 mr-1" />
                      AI生成
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleUploadCover}>
                      <Upload className="h-4 w-4 mr-1" />
                      上传
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label>内容配图 (最多9张)</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden relative">
                      {publishContent.contentImages[index] ? (
                        <>
                          <img 
                            src={publishContent.contentImages[index]} 
                            alt={`配图${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-1 right-1 h-5 w-5 p-0"
                            onClick={() => handleRemoveContentImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          {index + 1}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={handleGenerateContentImages}>
                    <Wand2 className="h-4 w-4 mr-1" />
                    AI生成配图
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleUploadContentImages}>
                    <Upload className="h-4 w-4 mr-1" />
                    上传图片
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">预览效果</h4>
                <div className="aspect-[3/4] w-64 bg-muted rounded-lg overflow-hidden relative mx-auto">
                  {publishContent.coverImage ? (
                    <img 
                      src={publishContent.coverImage} 
                      alt="封面" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      无封面
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/80 to-rose-500/80 flex items-center justify-center">
                    <h3 className="text-white text-sm font-bold text-center px-2">
                      {publishContent.title}
                    </h3>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {publishContent.content}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {publishContent.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={handlePublish} 
              disabled={publishStatus === "publishing"}
            >
              {publishStatus === "publishing" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  发布中...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  发布到 {platformConfigs.find(p => p.id === selectedPlatform)?.name}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
