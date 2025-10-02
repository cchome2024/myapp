import { NextRequest, NextResponse } from "next/server"
import { FileManager, getFileType } from "@/lib/file-manager"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const projectId = formData.get('projectId') as string
    const file = formData.get('file') as File
    
    if (!projectId || !file) {
      return NextResponse.json(
        { success: false, error: { message: "Project ID and file are required" } },
        { status: 400 }
      )
    }

    const fileManager = new FileManager(projectId)
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    
    // 根据文件类型决定存储位置
    const fileType = getFileType(file.name)
    const storageType = fileType === 'image' ? 'images' : 'files'
    
    // 保存文件
    const fileUrl = await fileManager.saveUploadedFile(fileBuffer, file.name, storageType)
    
    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        name: file.name,
        size: file.size,
        type: fileType
      }
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
  } catch (error) {
    console.error("Failed to upload file:", error)
    return NextResponse.json(
      { success: false, error: { message: "Failed to upload file" } },
      { status: 500 }
    )
  }
}
