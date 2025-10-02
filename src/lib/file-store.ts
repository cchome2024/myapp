import { promises as fs } from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json")

// 确保数据目录存在
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (error) {
    console.error("Failed to create data directory:", error)
  }
}

// 确保项目目录存在
async function ensureProjectDir(projectId: string) {
  const projectDir = path.join(DATA_DIR, "projects", projectId)
  try {
    await fs.mkdir(projectDir, { recursive: true })
  } catch (error) {
    console.error("Failed to create project directory:", error)
  }
  return projectDir
}

// 项目操作
export class ProjectStore {
  // 获取所有项目 - 从projects.json读取ID列表，然后从各个meta.json读取详细信息
  static async getProjects(): Promise<Project[]> {
    await ensureDataDir()
    
    try {
      // 读取projects.json获取项目ID列表
      const projectsData = await fs.readFile(PROJECTS_FILE, "utf-8")
      const projectIds = JSON.parse(projectsData)
      
      const projects: Project[] = []
      
      // 遍历每个项目ID，读取对应的meta.json
      for (const projectItem of projectIds) {
        const projectId = projectItem.id
        const projectDataStore = new ProjectDataStore(projectId)
        const meta = await projectDataStore.getMeta()
        if (meta) {
          projects.push(meta)
        }
      }
      
      return projects
    } catch (error) {
      console.error("Failed to read projects.json or meta files:", error)
      return []
    }
  }

  // 创建项目 - 添加到projects.json并创建meta.json
  static async createProject(project: Project): Promise<void> {
    await ensureDataDir()
    
    try {
      // 读取现有的projects.json
      let projectIds: { id: string }[] = []
      try {
        const data = await fs.readFile(PROJECTS_FILE, "utf-8")
        projectIds = JSON.parse(data)
      } catch {
        // 如果文件不存在，创建空数组
        projectIds = []
      }
      
      // 添加新项目ID
      projectIds.push({ id: project.id })
      
      // 写入projects.json
      await fs.writeFile(PROJECTS_FILE, JSON.stringify(projectIds, null, 2), "utf-8")
      
      // 创建项目的meta.json
      const projectDataStore = new ProjectDataStore(project.id)
      await projectDataStore.setMeta(project)
    } catch (error) {
      console.error("Failed to create project:", error)
      throw error
    }
  }

  // 更新项目 - 只更新meta.json
  static async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
    const projectDataStore = new ProjectDataStore(projectId)
    const currentMeta = await projectDataStore.getMeta()
    if (currentMeta) {
      const updatedMeta = { ...currentMeta, ...updates }
      await projectDataStore.setMeta(updatedMeta)
    }
  }

  // 删除项目 - 从projects.json移除ID并删除整个项目目录
  static async deleteProject(projectId: string): Promise<void> {
    try {
      // 从projects.json中移除项目ID
      const data = await fs.readFile(PROJECTS_FILE, "utf-8")
      const projectIds = JSON.parse(data)
      const filteredIds = projectIds.filter((p: { id: string }) => p.id !== projectId)
      await fs.writeFile(PROJECTS_FILE, JSON.stringify(filteredIds, null, 2), "utf-8")
      
      // 删除项目目录
      const projectDir = path.join(DATA_DIR, "projects", projectId)
      await fs.rm(projectDir, { recursive: true, force: true })
    } catch (error) {
      console.error("Failed to delete project:", error)
      throw error
    }
  }

  // 获取单个项目 - 直接从meta.json读取
  static async getProject(projectId: string): Promise<Project | null> {
    const projectDataStore = new ProjectDataStore(projectId)
    return await projectDataStore.getMeta()
  }
}

// 项目数据操作
export class ProjectDataStore {
  constructor(private projectId: string) {}

  private async getProjectDir() {
    return await ensureProjectDir(this.projectId)
  }

  // 元数据操作
  async getMeta(): Promise<Project | null> {
    const projectDir = await this.getProjectDir()
    try {
      const data = await fs.readFile(path.join(projectDir, "meta.json"), "utf-8")
      return JSON.parse(data)
    } catch (error) {
      console.error(`Failed to read meta.json for project ${this.projectId}:`, error)
      return null
    }
  }

  async setMeta(meta: Project): Promise<void> {
    const projectDir = await this.getProjectDir()
    await fs.writeFile(path.join(projectDir, "meta.json"), JSON.stringify(meta, null, 2), "utf-8")
  }

  // 输入数据操作
  async getInputs(): Promise<InputsData | null> {
    const projectDir = await this.getProjectDir()
    try {
      const data = await fs.readFile(path.join(projectDir, "inputs.json"), "utf-8")
      return JSON.parse(data)
    } catch {
      return null
    }
  }

  async setInputs(inputs: InputsData): Promise<void> {
    const projectDir = await this.getProjectDir()
    await fs.writeFile(path.join(projectDir, "inputs.json"), JSON.stringify(inputs, null, 2), "utf-8")
  }

  // 配置操作
  async getConfig(): Promise<GenerationConfig | null> {
    const projectDir = await this.getProjectDir()
    try {
      const data = await fs.readFile(path.join(projectDir, "config.json"), "utf-8")
      return JSON.parse(data)
    } catch {
      return null
    }
  }

  async setConfig(config: GenerationConfig): Promise<void> {
    const projectDir = await this.getProjectDir()
    await fs.writeFile(path.join(projectDir, "config.json"), JSON.stringify(config, null, 2), "utf-8")
  }

  // 摘要操作
  async getSummary(): Promise<Summary | null> {
    const projectDir = await this.getProjectDir()
    try {
      const data = await fs.readFile(path.join(projectDir, "summary.json"), "utf-8")
      return JSON.parse(data)
    } catch {
      return null
    }
  }

  async setSummary(summary: Summary): Promise<void> {
    const projectDir = await this.getProjectDir()
    await fs.writeFile(path.join(projectDir, "summary.json"), JSON.stringify(summary, null, 2), "utf-8")
  }

  // 测验操作 - 修复数据结构问题
  async getQuiz(): Promise<{ questions: QuizQuestion[] } | null> {
    const projectDir = await this.getProjectDir()
    try {
      const data = await fs.readFile(path.join(projectDir, "quiz.json"), "utf-8")
      const parsed = JSON.parse(data)
      
      // 处理不同的数据结构
      if (parsed.questions) {
        // 已经是正确格式 { questions: [...] }
        return parsed
      } else if (parsed.value && Array.isArray(parsed.value)) {
        // 数据格式是 { value: [...] }，需要转换
        return { questions: parsed.value }
      } else if (Array.isArray(parsed)) {
        // 数据格式是直接的数组 [...]
        return { questions: parsed }
      } else {
        console.error("Unexpected quiz data format:", parsed)
        return null
      }
    } catch (error) {
      console.error("Failed to parse quiz data:", error)
      return null
    }
  }

  async setQuiz(quiz: { questions: QuizQuestion[] }): Promise<void> {
    const projectDir = await this.getProjectDir()
    await fs.writeFile(path.join(projectDir, "quiz.json"), JSON.stringify(quiz, null, 2), "utf-8")
  }

  // 图片操作
  async getImages(): Promise<ImageData[]> {
    const projectDir = await this.getProjectDir()
    try {
      const data = await fs.readFile(path.join(projectDir, "images.json"), "utf-8")
      const parsed = JSON.parse(data)
      
      // 处理不同的数据结构
      if (Array.isArray(parsed)) {
        return parsed
      } else if (parsed.value && Array.isArray(parsed.value)) {
        return parsed.value
      } else {
        console.error("Unexpected images data format:", parsed)
        return []
      }
    } catch (error) {
      console.error("Failed to parse images data:", error)
      return []
    }
  }

  async setImages(images: ImageData[]): Promise<void> {
    const projectDir = await this.getProjectDir()
    await fs.writeFile(path.join(projectDir, "images.json"), JSON.stringify(images, null, 2), "utf-8")
  }

  // 幻灯片操作
  async getSlides(): Promise<SlideData[]> {
    const projectDir = await this.getProjectDir()
    try {
      const data = await fs.readFile(path.join(projectDir, "slides.json"), "utf-8")
      const parsed = JSON.parse(data)
      
      // 处理不同的数据结构
      if (Array.isArray(parsed)) {
        return parsed
      } else if (parsed.value && Array.isArray(parsed.value)) {
        return parsed.value
      } else {
        console.error("Unexpected slides data format:", parsed)
        return []
      }
    } catch (error) {
      console.error("Failed to parse slides data:", error)
      return []
    }
  }

  async setSlides(slides: SlideData[]): Promise<void> {
    const projectDir = await this.getProjectDir()
    await fs.writeFile(path.join(projectDir, "slides.json"), JSON.stringify(slides, null, 2), "utf-8")
  }

  // 参考资料操作
  async getReferences(): Promise<ReferenceData[]> {
    const projectDir = await this.getProjectDir()
    try {
      const data = await fs.readFile(path.join(projectDir, "references.json"), "utf-8")
      const parsed = JSON.parse(data)
      
      // 处理不同的数据结构
      if (Array.isArray(parsed)) {
        return parsed
      } else if (parsed.value && Array.isArray(parsed.value)) {
        return parsed.value
      } else {
        console.error("Unexpected references data format:", parsed)
        return []
      }
    } catch (error) {
      console.error("Failed to parse references data:", error)
      return []
    }
  }

  async setReferences(references: ReferenceData[]): Promise<void> {
    const projectDir = await this.getProjectDir()
    await fs.writeFile(path.join(projectDir, "references.json"), JSON.stringify(references, null, 2), "utf-8")
  }
}

// 类型定义
export interface Project {
  id: string
  name: string
  date: string
  status: "draft" | "processing" | "complete" | "error"
  description?: string
  tags?: string[]
}

export interface InputsData {
  urls: string[]
  prompts: {
    summary: string
    images: string
    ppt: string
    custom: string
  }
  files: Array<{
    filename: string
    originalName: string
    mime: string
    size: number
    uploadedAt: string
  }>
}

export interface GenerationConfig {
  webSearchEnabled: boolean
  generatePPT: boolean
  autoImages: boolean
  imageStyle: string
  language: string
  summaryLevel: string
  quizCount: number
}

export interface Summary {
  text: string
  html: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface ImageData {
  id: string
  url: string
  title: string
  description: string
  category: string
}

export interface SlideData {
  id: string
  title: string
  content: string
  thumbnail: string
  order?: number
}

export interface ReferenceData {
  id: string
  title: string
  url: string
  description: string
  type: string
}
