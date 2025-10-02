"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Upload, LinkIcon, X, FileText, Copy, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface UploadedFile {
  name: string
  size: string
  type: "pdf" | "docx" | "url"
  url?: string
}

interface ProjectData {
  id: string
  name: string
  date: string
  status: string
  description?: string
  tags?: string[]
}

interface InputFile {
  filename: string
  originalName: string
  mime: string
  size: number
  uploadedAt: string
  url?: string
}

interface InputsData {
  urls?: string[]
  prompts?: {
    summary?: string
    images?: string
    ppt?: string
    custom?: string
  }
  files?: InputFile[]
}

interface UploadSectionProps {
  selectedProject?: string
}

export function UploadSection({ selectedProject }: UploadSectionProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [urlInput, setUrlInput] = useState("")
  const [textInput, setTextInput] = useState("")
  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const { toast } = useToast()

  // 当选择项目时，加载项目数据并反显内容
  useEffect(() => {
    if (!selectedProject) {
      // 如果没有选择项目，清空所有内容
      setFiles([])
      setTextInput("")
      setProjectData(null)
      return
    }

    const fetchProjectData = async () => {
      try {
        setLoading(true)
        
        // 获取项目基本信息
        const projectResponse = await fetch(`/api/mock/projects?projectId=${selectedProject}`)
        const projectResult = await projectResponse.json()
        
        if (projectResult.success && projectResult.data && projectResult.data.length > 0) {
          const project = projectResult.data[0]
          setProjectData(project)
        }
        
        // 获取用户输入数据
        const inputsResponse = await fetch(`/api/mock/inputs?projectId=${selectedProject}`)
        const inputsResult = await inputsResponse.json()
        
        if (inputsResult.success && inputsResult.data) {
          const inputs = inputsResult.data as InputsData
          
          // 反显上传的文件和URL
          const uploadedFiles: UploadedFile[] = []
          
          // 处理上传的文件
          if (inputs.files && Array.isArray(inputs.files)) {
            inputs.files.forEach((file) => {
              uploadedFiles.push({
                name: file.originalName || file.filename,
                size: `${(file.size / 1024).toFixed(1)} KB`,
                type: file.mime === "application/pdf" ? "pdf" : "docx",
                url: file.url
              })
            })
          }
          
          // 处理URL链接
          if (inputs.urls && Array.isArray(inputs.urls)) {
            inputs.urls.forEach((url: string) => {
              if (url) {
                uploadedFiles.push({
                  name: url,
                  size: "URL",
                  type: "url"
                })
              }
            })
          }
          
          setFiles(uploadedFiles)
          
          // 反显自定义内容
          if (inputs.prompts && inputs.prompts.custom) {
            setTextInput(inputs.prompts.custom)
          } else {
            setTextInput("")
          }
        }
      } catch (error) {
        console.error("Failed to fetch project data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjectData()
  }, [selectedProject])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || [])
    
    if (!selectedProject) {
      toast({
        title: "请先选择项目",
        description: "请先选择一个项目再上传文件",
        variant: "destructive"
      })
      return
    }

    if (uploadedFiles.length === 0) return

    setUploading(true)
    
    try {
      const uploadPromises = uploadedFiles.map(async (file) => {
        const formData = new FormData()
        formData.append('projectId', selectedProject)
        formData.append('file', file)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        const result = await response.json()
        
        if (result.success) {
          return {
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            type: file.name.endsWith(".pdf") ? ("pdf" as const) : ("docx" as const),
            url: result.data.url
          }
        } else {
          throw new Error(result.error?.message || 'Upload failed')
        }
      })
      
      const newFiles = await Promise.all(uploadPromises)
      setFiles([...files, ...newFiles])
      
      toast({
        title: "上传成功",
        description: `成功上传 ${newFiles.length} 个文件`,
      })
      
    } catch (error) {
      console.error("Upload failed:", error)
      toast({
        title: "上传失败",
        description: "文件上传失败，请重试",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
      // 清空input值，允许重复选择同一文件
      e.target.value = ''
    }
  }

  const handleUrlAdd = () => {
    if (urlInput.trim()) {
      setFiles([...files, { name: urlInput, size: "URL", type: "url" }])
      setUrlInput("")
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  // 截断长URL显示
  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url
    return url.substring(0, maxLength) + "..."
  }

  // 复制URL到剪贴板
  const copyUrl = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedIndex(index)
      toast({
        title: "复制成功",
        description: "URL已复制到剪贴板",
      })
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (error) {
      toast({
        title: "复制失败",
        description: "无法复制到剪贴板",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">学习资料</CardTitle>
          <CardDescription>加载中...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">学习资料</CardTitle>
          <CardDescription>上传文档或输入URL链接</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 文件上传区域 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">上传文档</label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                multiple
                accept=".pdf,.docx"
                onChange={handleFileUpload}
                className="flex-1"
                disabled={uploading || !selectedProject}
              />
              <Button 
                variant="outline" 
                size="sm"
                disabled={uploading || !selectedProject}
                onClick={() => {
                  const input = document.querySelector('input[type="file"]') as HTMLInputElement
                  input?.click()
                }}
              >
                <Upload className="h-4 w-4 mr-1" />
                {uploading ? "上传中..." : "选择文件"}
              </Button>
            </div>
            {!selectedProject && (
              <p className="text-xs text-muted-foreground">请先选择一个项目</p>
            )}
          </div>

          {/* URL输入区域 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">添加URL链接</label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="输入URL链接..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleUrlAdd()
                }}
              />
              <Button variant="outline" size="sm" onClick={handleUrlAdd}>
                <LinkIcon className="h-4 w-4 mr-1" />
                添加
              </Button>
            </div>
          </div>

          {/* 已上传文件列表 */}
          {files.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">已添加的学习资料</label>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-start justify-between p-3 rounded-lg gap-2 ${
                      file.type === "url" 
                        ? "bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-800" 
                        : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      {file.type === "url" ? (
                        <LinkIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p 
                          className={`text-sm font-medium break-all ${
                            file.type === "url" 
                              ? "text-blue-700 dark:text-blue-300" 
                              : "text-foreground"
                          }`}
                          title={file.name}
                        >
                          {file.type === "url" ? truncateUrl(file.name) : file.name}
                        </p>
                        <p className={`text-xs ${
                          file.type === "url" 
                            ? "text-blue-600 dark:text-blue-400" 
                            : "text-muted-foreground"
                        }`}>
                          {file.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {file.type === "url" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyUrl(file.name, index)}
                          className="h-8 w-8 p-0"
                        >
                          {copiedIndex === index ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 自定义内容输入 */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">自定义内容</CardTitle>
          <CardDescription>输入您想要学习的特定内容或问题</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="例如：我想了解深度学习中的卷积神经网络原理，特别是反向传播算法的实现细节..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </CardContent>
      </Card>
    </div>
  )
}
