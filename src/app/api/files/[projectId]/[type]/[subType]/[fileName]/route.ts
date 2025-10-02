import { NextRequest, NextResponse } from "next/server"
import { FileManager } from "@/lib/file-manager"
import path from "path"

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string, type: string, subType: string, fileName: string } }
) {
  try {
    const { projectId, type, subType, fileName } = params
    
    if (!projectId || !type || !subType || !fileName) {
      return new NextResponse("Missing parameters", { status: 400 })
    }

    const fileManager = new FileManager(projectId)
    
    // 构建相对路径
    const relativePath = path.join(type, subType, fileName)
    
    // 读取文件
    const fileBuffer = await fileManager.readFile(relativePath)
    
    // 获取文件扩展名来确定MIME类型
    const ext = path.extname(fileName).toLowerCase()
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.md': 'text/markdown',
      '.html': 'text/html',
      '.json': 'application/json'
    }
    
    const mimeType = mimeTypes[ext] || 'application/octet-stream'
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000', // 缓存1年
      },
    })
  } catch (error) {
    console.error("Failed to serve file:", error)
    return new NextResponse("File not found", { status: 404 })
  }
}
