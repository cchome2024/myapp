"use client"

import { useState, useEffect } from "react"
import { ExternalLink, Download, Copy, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ReferenceData {
  id: string
  title: string
  url: string
  description: string
  source: string
  date: string
}

export function ReferencesTab() {
  const [references, setReferences] = useState<ReferenceData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        setLoading(true)
        // 暂时返回空数据，因为后端还没有实现 references 接口
        setReferences([])
      } catch (error) {
        console.error("Failed to fetch references:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReferences()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-3/4 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-3 w-full rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {references.map((ref) => (
        <Card key={ref.id}>
          <CardHeader>
            <CardTitle className="text-sm">{ref.title}</CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{ref.source}</span>
              <span>•</span>
              <span>{ref.date}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs leading-relaxed text-muted-foreground">{ref.description}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                <a href={ref.url} target="_blank" rel="noopener noreferrer">
                  访问来源
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
                onClick={() => {
                  navigator.clipboard.writeText(`${ref.title} - ${ref.url}`)
                }}
              >
                <Copy className="mr-2 h-3 w-3" />
                复制引用
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button className="w-full">
        <Download className="mr-2 h-4 w-4" />
        导出参考文献列表
      </Button>
    </div>
  )
}
