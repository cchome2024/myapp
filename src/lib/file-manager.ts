import { promises as fs } from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")

export class FileManager {
  constructor(private projectId: string) {}

  private getProjectDir() {
    return path.join(DATA_DIR, "projects", this.projectId)
  }

  // 获取文件存储路径
  private getStoragePath(type: 'uploads' | 'generated' | 'temp', subType?: string) {
    const basePath = path.join(this.getProjectDir(), type)
    return subType ? path.join(basePath, subType) : basePath
  }

  // 生成文件名
  private generateFileName(originalName: string, type: 'upload' | 'generated' | 'temp' = 'upload', description?: string) {
    const timestamp = Date.now()
    const ext = path.extname(originalName)
    const name = path.basename(originalName, ext)
    
    switch (type) {
      case 'upload':
        return `${timestamp}_${name}${ext}`
      case 'generated':
        return `${description || 'generated'}_${timestamp}${ext}`
      case 'temp':
        return `temp_${timestamp}_${description || 'file'}${ext}`
      default:
        return `${timestamp}_${name}${ext}`
    }
  }

  // 保存用户上传的文件
  async saveUploadedFile(file: Buffer, originalName: string, fileType: 'files' | 'images' = 'files'): Promise<string> {
    const fileName = this.generateFileName(originalName, 'upload')
    const storagePath = this.getStoragePath('uploads', fileType)
    const filePath = path.join(storagePath, fileName)
    
    await fs.writeFile(filePath, file)
    
    // 返回后端API路径
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
    return `${API_BASE}/projects/${this.projectId}/files/uploads/${fileType}/${fileName}`
  }

  // 保存AI生成的文件
  async saveGeneratedFile(file: Buffer, fileName: string, type: 'images' | 'slides' | 'exports' = 'images'): Promise<string> {
    const storagePath = this.getStoragePath('generated', type)
    const filePath = path.join(storagePath, fileName)
    
    await fs.writeFile(filePath, file)
    
    // 返回后端API路径
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
    return `${API_BASE}/projects/${this.projectId}/files/generated/${type}/${fileName}`
  }

  // 保存临时文件
  async saveTempFile(file: Buffer, originalName: string, purpose: string): Promise<string> {
    const fileName = this.generateFileName(originalName, 'temp', purpose)
    const storagePath = this.getStoragePath('temp')
    const filePath = path.join(storagePath, fileName)
    
    await fs.writeFile(filePath, file)
    
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
    return `${API_BASE}/projects/${this.projectId}/files/temp/${fileName}`
  }

  // 读取文件
  async readFile(relativePath: string): Promise<Buffer> {
    const filePath = path.join(this.getProjectDir(), relativePath)
    return await fs.readFile(filePath)
  }

  // 删除文件
  async deleteFile(relativePath: string): Promise<void> {
    const filePath = path.join(this.getProjectDir(), relativePath)
    await fs.unlink(filePath)
  }

  // 列出目录中的文件
  async listFiles(type: 'uploads' | 'generated' | 'temp', subType?: string): Promise<string[]> {
    const storagePath = this.getStoragePath(type, subType)
    try {
      const files = await fs.readdir(storagePath)
      return files.filter(file => file !== 'README.md')
    } catch {
      return []
    }
  }

  // 获取文件信息
  async getFileInfo(relativePath: string) {
    const filePath = path.join(this.getProjectDir(), relativePath)
    try {
      const stats = await fs.stat(filePath)
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      }
    } catch {
      return null
    }
  }

  // 复制文件到public目录（用于静态访问）
  async copyToPublic(relativePath: string, publicPath: string): Promise<void> {
    const sourcePath = path.join(this.getProjectDir(), relativePath)
    const targetPath = path.join(process.cwd(), "public", publicPath)
    
    // 确保目标目录存在
    await fs.mkdir(path.dirname(targetPath), { recursive: true })
    
    // 复制文件
    await fs.copyFile(sourcePath, targetPath)
  }
}

// 文件类型检测
export function getFileType(fileName: string): 'image' | 'document' | 'other' {
  const ext = path.extname(fileName).toLowerCase()
  
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  const docExts = ['.pdf', '.doc', '.docx', '.txt', '.md']
  
  if (imageExts.includes(ext)) return 'image'
  if (docExts.includes(ext)) return 'document'
  return 'other'
}

// 文件大小格式化
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
