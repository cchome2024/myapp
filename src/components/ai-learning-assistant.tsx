"use client"

import { useState, useEffect } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { Workspace } from "./workspace"
import { ResultsPanel } from "./results-panel"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

export type ProcessingStep = "idle" | "parsing" | "indexing" | "summary" | "quiz" | "images" | "ppt" | "complete"

export interface Project {
  id: string
  name: string
  date: string
  status: "draft" | "processing" | "complete" | "error"
}

export function AILearningAssistant() {
  const [currentStep, setCurrentStep] = useState<ProcessingStep>("idle")
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [projectName, setProjectName] = useState<string>("未命名项目")
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/mock/projects")
        const result = await response.json()
        if (result.success) {
          setProjects(result.data)
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      }
    }

    fetchProjects()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      const project = projects.find((p) => p.id === selectedProject)
      if (project) {
        setProjectName(project.name)
      }
    }
  }, [selectedProject, projects])

  const handleProjectSelect = (id: string, status: "draft" | "processing" | "complete" | "error") => {
    setSelectedProject(id)
    setCurrentStep("idle")
  }

  const handleNewProject = async () => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: "新项目",
      date: new Date().toLocaleDateString(),
      status: "draft",
    }
    
    // 立即保存新项目到文件系统
    try {
      const response = await fetch(`/api/projects/${newProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProject.name,
          status: newProject.status,
          lastModified: new Date().toISOString(),
        })
      })

      if (response.ok) {
        // 更新本地状态
        setProjects((prev) => [newProject, ...prev])
        setSelectedProject(newProject.id)
        setProjectName(newProject.name)
        setCurrentStep("idle")
        
        toast({
          title: "新项目创建成功",
          description: `项目 "${newProject.name}" 已创建`,
        })
      } else {
        throw new Error('创建项目失败')
      }
    } catch (error) {
      console.error("创建新项目失败:", error)
      toast({
        title: "创建失败",
        description: "创建新项目时发生错误，请重试",
        variant: "destructive",
      })
    }
  }

  const handleStepChange = (step: ProcessingStep) => {
    setCurrentStep(step)
  }

  const handleProjectNameChange = (name: string) => {
    setProjectName(name)
    if (selectedProject) {
      setProjects((prev) =>
        prev.map((p) => (p.id === selectedProject ? { ...p, name } : p))
      )
    }
    toast({
      title: "项目名称已更新",
      description: `项目已重命名为 "${name}"`,
    })
  }

  const handleSaveProject = async () => {
    if (!selectedProject) {
      toast({
        title: "保存失败",
        description: "请先选择一个项目",
        variant: "destructive",
      })
      return
    }

    try {
      // 调用保存API
      const response = await fetch(`/api/projects/${selectedProject}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          status: currentStep === "complete" ? "complete" : "draft",
          lastModified: new Date().toISOString(),
        })
      })

      if (!response.ok) {
        throw new Error('保存失败')
      }

      // 更新本地项目状态
      setProjects((prev) =>
        prev.map((p) => 
          p.id === selectedProject 
            ? { 
                ...p, 
                name: projectName,
                status: currentStep === "complete" ? "complete" : "draft"
              } 
            : p
        )
      )
      
      toast({
        title: "保存成功",
        description: `项目 "${projectName}" 已保存`,
      })
    } catch (error) {
      console.error("保存项目失败:", error)
      toast({
        title: "保存失败",
        description: "保存项目时发生错误，请重试",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={handleProjectSelect}
        onNewProject={handleNewProject}
      />

      <div className="flex flex-1 min-w-0 min-h-0">
        {/* Main Workspace */}
        <Workspace
          currentStep={currentStep}
          onStepChange={handleStepChange}
          webSearchEnabled={webSearchEnabled}
          onWebSearchChange={setWebSearchEnabled}
          projectName={projectName}
          onProjectNameChange={handleProjectNameChange}
          selectedProject={selectedProject ?? undefined}
          onSaveProject={handleSaveProject}
        />

        {/* Right Results Panel */}
        <ResultsPanel 
          currentStep={currentStep} 
          webSearchEnabled={webSearchEnabled} 
          selectedProject={selectedProject ?? undefined}
        />
      </div>
    </div>
  )
}
