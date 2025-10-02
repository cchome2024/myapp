# 更新QuizTab
(Get-Content "src/components/tabs/quiz-tab.tsx") -replace 'interface QuizTabProps \{\s*currentStep: ProcessingStep\s*\}', 'interface QuizTabProps {\n  currentStep: ProcessingStep\n  projectId?: string\n}' | Out-File "src/components/tabs/quiz-tab.tsx" -Encoding UTF8

# 更新ImagesTab
(Get-Content "src/components/tabs/images-tab.tsx") -replace 'interface ImagesTabProps \{\s*currentStep: ProcessingStep\s*\}', 'interface ImagesTabProps {\n  currentStep: ProcessingStep\n  projectId?: string\n}' | Out-File "src/components/tabs/images-tab.tsx" -Encoding UTF8

# 更新PPTTab
(Get-Content "src/components/tabs/ppt-tab.tsx") -replace 'interface PPTTabProps \{\s*currentStep: ProcessingStep\s*\}', 'interface PPTTabProps {\n  currentStep: ProcessingStep\n  projectId?: string\n}' | Out-File "src/components/tabs/ppt-tab.tsx" -Encoding UTF8

# 更新PublishTab
(Get-Content "src/components/tabs/publish-tab.tsx") -replace 'interface PublishTabProps \{\s*currentStep: ProcessingStep\s*\}', 'interface PublishTabProps {\n  currentStep: ProcessingStep\n  projectId?: string\n}' | Out-File "src/components/tabs/publish-tab.tsx" -Encoding UTF8
