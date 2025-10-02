"use client"

import { useState, useEffect } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { Workspace } from "./workspace"
import { ResultsPanel } from "./results-panel"
import { useToast } from "@/hooks/use-toast"

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

  // 自动进度处理 - 只在用户点击开始生成后执行
  useEffect(() => {
    if (isProcessing && currentStep !== "idle" && currentStep !== "complete") {
      const stepOrder: ProcessingStep[] = ["parsing", "indexing", "summary", "quiz", "images", "ppt", "complete"]
      const currentIndex = stepOrder.indexOf(currentStep)
      
      if (currentIndex < stepOrder.length - 1) {
        const nextStep = stepOrder[currentIndex + 1]
        const delay = currentStep === "parsing" ? 2000 : 
                     currentStep === "indexing" ? 1500 : 
                     currentStep === "summary" ? 3000 : 
                     currentStep === "quiz" ? 2000 : 
                     currentStep === "images" ? 2500 : 
                     currentStep === "ppt" ? 2000 : 1000

        const timer = setTimeout(() => {
          setCurrentStep(nextStep)
          if (nextStep === "complete") {
            setIsProcessing(false)
            toast({
              title: "处理完成",
              description: "所有内容已生成完成！",
            })
          }
        }, delay)

        return () => clearTimeout(timer)
      }
    }
  }, [currentStep, isProcessing, toast])

  const handleProjectSelect = (projectId: string, status: "draft" | "processing" | "complete" | "error") => {
    setSelectedProject(projectId)
    // 选择项目时不自动开始处理，保持idle状态
    setCurrentStep("idle")
    setIsProcessing(false)
  }

  const handleNewProject = () => {
    const newProjectName = `新项目 - ${new Date().toLocaleDateString("zh-CN")}`
    setProjectName(newProjectName)
    setSelectedProject(null)
    setCurrentStep("idle")
    setIsProcessing(false)
  }

  const handleProjectNameChange = (name: string) => {
    setProjectName(name)
    if (selectedProject) {
      // 更新项目名称
      const updatedProjects = projects.map((p) => (p.id === selectedProject ? { ...p, name } : p))
      setProjects(updatedProjects)
      toast({
        title: "项目已更新",
        description: `项目已重命名为 "${name}"`,
      })
    }
  }

  const handleStepChange = (step: ProcessingStep) => {
    setCurrentStep(step)
    if (step === "idle") {
      setIsProcessing(false)
    } else if (step === "parsing") {
      setIsProcessing(true)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <Sidebar
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={handleProjectSelect}
        onNewProject={handleNewProject}
      />

      <div className="flex flex-1 min-w-0">
        {/* Main Workspace */}
        <Workspace
          currentStep={currentStep}
          onStepChange={handleStepChange}
          webSearchEnabled={webSearchEnabled}
          onWebSearchChange={setWebSearchEnabled}
          projectName={projectName}
          onProjectNameChange={handleProjectNameChange}
          selectedProject={selectedProject ?? undefined}
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
