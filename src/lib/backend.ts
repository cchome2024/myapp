const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

export interface GenerationConfig {
  webSearchEnabled: boolean
  generatePPT: boolean
  autoImages: boolean
  imageStyle: "academic" | "flat" | "realistic" | "wireframe"
  language: "zh" | "en"
  summaryLevel: "chapter" | "global" | "both"
  quizCount: number
}

export interface ProjectStatus {
  step: string
  percent: number
  status: "idle" | "running" | "complete" | "error"
  lastError?: string
  lock?: any
  history: any[]
}

export interface SummaryData {
  text: string
  html: string
}

export interface QuizData {
  questions: any[]
}

export interface ImagesData {
  items: any[]
}

export interface SlidesData {
  slides: any[]
}

/**
 * 启动项目处理
 */
export async function startProject(id: string, cfg: GenerationConfig): Promise<{ ok: boolean }> {
  try {
    const response = await fetch(`${API_BASE}/projects/${id}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cfg)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to start project:', error)
    throw error
  }
}

/**
 * 获取项目状态
 */
export async function getStatus(id: string): Promise<ProjectStatus> {
  try {
    const response = await fetch(`${API_BASE}/projects/${id}/status`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to get project status:', error)
    return {
      step: "parsing",
      percent: 0,
      status: "idle",
      history: []
    }
  }
}

/**
 * 获取项目摘要
 */
export async function getSummary(id: string): Promise<SummaryData> {
  try {
    const response = await fetch(`${API_BASE}/projects/${id}/files/summary.json`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    // 确保返回的数据包含 html 字段
    return {
      text: data.text || "",
      html: data.html || data.text || ""
    }
  } catch (error) {
    console.error('Failed to get summary:', error)
    return { text: "", html: "" }
  }
}

/**
 * 获取测验数据
 */
export async function getQuiz(id: string): Promise<QuizData> {
  try {
    const response = await fetch(`${API_BASE}/projects/${id}/files/quiz.json`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to get quiz:', error)
    return { questions: [] }
  }
}

/**
 * 获取图片数据
 */
export async function getImages(id: string): Promise<ImagesData> {
  try {
    console.log('getImages: Fetching images for project:', id)
    const response = await fetch(`${API_BASE}/projects/${id}/files/images.json`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('getImages: Raw data from backend:', data)
    
    // 处理后端返回的数据格式 { value: [...] }
    let items = []
    if (data && Array.isArray(data.value)) {
      console.log('getImages: Using data.value, count:', data.value.length)
      items = data.value
    } else if (Array.isArray(data)) {
      console.log('getImages: Using direct array, count:', data.length)
      items = data
    } else if (data && Array.isArray(data.items)) {
      console.log('getImages: Using data.items, count:', data.items.length)
      items = data.items
    }
    
    // 处理相对路径的图片URL
    const processedItems = items.map((item: any) => {
      if (item.url && item.url.startsWith('/')) {
        // 将相对路径转换为完整的后端URL
        return {
          ...item,
          url: `${API_BASE}${item.url}`
        }
      }
      return item
    })
    
    console.log('getImages: Processed items count:', processedItems.length)
    return { items: processedItems }
  } catch (error) {
    console.error('Failed to get images:', error)
    return { items: [] }
  }
}

/**
 * 获取幻灯片数据
 */
export async function getSlides(id: string): Promise<SlidesData> {
  try {
    console.log('getSlides: Fetching slides for project:', id)
    const response = await fetch(`${API_BASE}/projects/${id}/files/slides.json`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('getSlides: Raw data from backend:', data)
    
    // 处理后端返回的数据格式 { value: [...] }
    let slides = []
    if (data && Array.isArray(data.value)) {
      console.log('getSlides: Using data.value, count:', data.value.length)
      slides = data.value
    } else if (Array.isArray(data)) {
      console.log('getSlides: Using direct array, count:', data.length)
      slides = data
    } else if (data && Array.isArray(data.slides)) {
      console.log('getSlides: Using data.slides, count:', data.slides.length)
      slides = data.slides
    }
    
    // 处理相对路径的缩略图URL
    const processedSlides = slides.map((slide: any) => {
      if (slide.thumbnail && slide.thumbnail.startsWith('/')) {
        // 将相对路径转换为完整的后端URL
        return {
          ...slide,
          thumbnail: `${API_BASE}${slide.thumbnail}`
        }
      }
      return slide
    })
    
    console.log('getSlides: Processed slides count:', processedSlides.length)
    return { slides: processedSlides }
  } catch (error) {
    console.error('Failed to get slides:', error)
    return { slides: [] }
  }
}

/**
 * 获取项目列表
 */
export async function getProjects(): Promise<{ success: boolean; data: any[] }> {
  try {
    const response = await fetch(`${API_BASE}/api/projects`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to get projects:', error)
    return { success: false, data: [] }
  }
}

/**
 * 更新项目
 */
export async function updateProject(id: string, data: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to update project:', error)
    return { success: false, error: String(error) }
  }
}
