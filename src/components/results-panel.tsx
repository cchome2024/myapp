"use client"

import { FileText, HelpCircle, ImageIcon, FileSliders as FileSlides, Link, Rocket } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SummaryTab } from "./tabs/summary-tab"
import { QuizTab } from "./tabs/quiz-tab"
import { PPTTab } from "./tabs/ppt-tab"
import { ImagesTab } from "./tabs/images-tab"
import { ReferencesTab } from "./tabs/references-tab"
import { PublishTab } from "./tabs/publish-tab"
import type { ProcessingStep } from "./ai-learning-assistant"

interface ResultsPanelProps {
  currentStep: ProcessingStep
  webSearchEnabled: boolean
  selectedProject?: string
}

export function ResultsPanel({ currentStep, webSearchEnabled, selectedProject }: ResultsPanelProps) {
  // 只要选择了项目就显示结果面板
  const shouldShow = selectedProject !== null

  if (!shouldShow) {
    return (
      <aside className="hidden w-96 flex-col border-l bg-card lg:flex">
        <div className="flex h-full flex-col">
          <div className="flex-shrink-0 border-b p-5 shadow-sm">
            <h2 className="font-semibold text-lg">生成结果</h2>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">请选择一个项目查看结果</p>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="hidden w-96 flex-col border-l bg-card lg:flex">
      <div className="flex h-full flex-col">
        <div className="flex-shrink-0 border-b p-5 shadow-sm">
          <h2 className="font-semibold text-lg">生成结果</h2>
        </div>

        <Tabs defaultValue="summary" className="flex flex-1 min-h-0 flex-col">
          <div className="flex-shrink-0 border-b bg-muted/30 px-5 pt-2">
            <TabsList className="w-full justify-start bg-transparent">
              <TabsTrigger value="summary" className="gap-2">
                <FileText className="h-4 w-4" />
                摘要
              </TabsTrigger>
              <TabsTrigger value="quiz" className="gap-2">
                <HelpCircle className="h-4 w-4" />
                Quiz
              </TabsTrigger>
              <TabsTrigger value="ppt" className="gap-2">
                <FileSlides className="h-4 w-4" />
                PPT
              </TabsTrigger>
              <TabsTrigger value="images" className="gap-2">
                <ImageIcon className="h-4 w-4" />
                配图
              </TabsTrigger>
              <TabsTrigger value="publish" className="gap-2">
                <Rocket className="h-4 w-4" />
                发布
              </TabsTrigger>
              {webSearchEnabled && (
                <TabsTrigger value="references" className="gap-2">
                  <Link className="h-4 w-4" />
                  来源
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <TabsContent value="summary" className="m-0 p-5">
                <SummaryTab currentStep={currentStep} projectId={selectedProject} />
              </TabsContent>
              <TabsContent value="quiz" className="m-0 p-5">
                <QuizTab currentStep={currentStep} projectId={selectedProject} />
              </TabsContent>
              <TabsContent value="ppt" className="m-0 p-5">
                <PPTTab currentStep={currentStep} projectId={selectedProject} />
              </TabsContent>
              <TabsContent value="images" className="m-0 p-5">
                <ImagesTab currentStep={currentStep} projectId={selectedProject} />
              </TabsContent>
              <TabsContent value="publish" className="m-0 p-5">
                <PublishTab currentStep={currentStep} projectId={selectedProject} />
              </TabsContent>
              {webSearchEnabled && (
                <TabsContent value="references" className="m-0 p-5">
                  <ReferencesTab />
                </TabsContent>
              )}
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    </aside>
  )
}
