"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Clock, CheckCircle2, AlertCircle, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Project } from "./ai-learning-assistant"

interface SidebarProps {
  projects?: Project[]
  selectedProject: string | null
  onSelectProject: (id: string, status: "draft" | "processing" | "complete" | "error") => void
  onNewProject: () => void
}

const statusConfig = {
  draft: { icon: FileText, label: "草稿", color: "text-muted-foreground", bgColor: "bg-muted" },
  processing: {
    icon: Clock,
    label: "处理中",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-950",
  },
  complete: {
    icon: CheckCircle2,
    label: "已完成",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-950",
  },
  error: { icon: AlertCircle, label: "错误", color: "text-destructive", bgColor: "bg-destructive/10" },
}

export function Sidebar({ projects: externalProjects, selectedProject, onSelectProject, onNewProject }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [projects, setProjects] = useState<Project[]>(externalProjects ?? [])
  const [loading, setLoading] = useState(externalProjects === undefined)

  useEffect(() => {
    if (externalProjects !== undefined) {
      setProjects(externalProjects)
      setLoading(false)
      return
    }

    let isMounted = true

    const fetchProjects = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/mock/projects")
        const result = await response.json()
        if (result.success && isMounted) {
          setProjects(result.data)
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch projects:", error)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchProjects()

    return () => {
      isMounted = false
    }
  }, [externalProjects])

  const filteredProjects = projects.filter((project) => project.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <aside className="hidden w-72 flex-col border-r bg-gradient-to-b from-card via-card to-primary/5 lg:flex">
      <div className="flex h-full flex-col">
        <div className="flex-shrink-0 border-b bg-gradient-to-r from-primary/10 to-secondary/10 p-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索历史项目..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-primary/20 focus-visible:ring-primary/30"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full p-5">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProjects.map((project) => {
                  const StatusIcon = statusConfig[project.status].icon
                  return (
                    <button
                      key={project.id}
                      onClick={() => onSelectProject(project.id, project.status)}
                      className={cn(
                        "w-full rounded-lg border bg-gradient-to-br from-background to-background/50 p-3.5 text-left shadow-sm transition-all hover:shadow-md hover:scale-[1.02]",
                        selectedProject === project.id &&
                          "border-primary/50 bg-gradient-to-br from-primary/10 to-secondary/10 shadow-md ring-2 ring-primary/20",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-1">
                          <h3 className="font-medium leading-none">{project.name}</h3>
                          <p className="text-xs text-muted-foreground">{project.date}</p>
                        </div>
                        <div className={cn("rounded-full p-1.5", statusConfig[project.status].bgColor)}>
                          <StatusIcon className={cn("h-3.5 w-3.5", statusConfig[project.status].color)} />
                        </div>
                      </div>
                      <div className="mt-2">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            statusConfig[project.status].bgColor,
                            statusConfig[project.status].color,
                          )}
                        >
                          {statusConfig[project.status].label}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex-shrink-0 border-t bg-gradient-to-r from-primary/5 to-secondary/5 p-5">
          <Button
            onClick={onNewProject}
            className="w-full shadow-md bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            size="lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            新建项目
          </Button>
        </div>
      </div>
    </aside>
  )
}
