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

  const handleProjectSelect = (id: string, status: "draft" | "processing" | "complete" | "error") => {
    setSelectedProject(id)
    setCurrentStep("idle")
  }

  const handleNewProject = () => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: "新项目",
      date: new Date().toLocaleDateString(),
      status: "draft",
    }
    setProjects((prev) => [newProject, ...prev])
    setSelectedProject(newProject.id)
    setCurrentStep("idle")
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
