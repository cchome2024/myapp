import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const PROJECTS_DIR = path.join(DATA_DIR, 'projects')

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    const body = await request.json()
    const { name, status, lastModified } = body

    // 确保数据目录存在
    await fs.mkdir(DATA_DIR, { recursive: true })

    // 检查项目目录是否存在，如果不存在则创建
    const projectDir = path.join(PROJECTS_DIR, projectId)
    let isNewProject = false
    
    try {
      await fs.access(projectDir)
    } catch (error) {
      // 项目目录不存在，创建新项目
      isNewProject = true
      await fs.mkdir(projectDir, { recursive: true })
    }

    // 更新或创建项目目录中的 meta.json
    const metaFilePath = path.join(projectDir, 'meta.json')
    let meta
    
    if (isNewProject) {
      // 创建新的 meta.json
      meta = {
        id: projectId,
        name: name || "新项目",
        date: new Date().toISOString(),
        status: status || "draft",
        createdAt: new Date().toISOString(),
        updatedAt: lastModified || new Date().toISOString(),
        description: "",
        tags: []
      }
    } else {
      // 读取现有的 meta.json
      try {
        const metaData = await fs.readFile(metaFilePath, 'utf-8')
        meta = JSON.parse(metaData)
        
        // 更新 meta.json 中的项目信息
        meta.name = name || meta.name
        meta.status = status || meta.status
        meta.updatedAt = lastModified || new Date().toISOString()
      } catch (error) {
        // 如果读取失败，创建新的 meta.json
        meta = {
          id: projectId,
          name: name || "新项目",
          date: new Date().toISOString(),
          status: status || "draft",
          createdAt: new Date().toISOString(),
          updatedAt: lastModified || new Date().toISOString(),
          description: "",
          tags: []
        }
      }
    }
    
    // 保存 meta.json
    await fs.writeFile(metaFilePath, JSON.stringify(meta, null, 2), 'utf-8')
    
    // 如果是新项目，需要更新 projects.json
    if (isNewProject) {
      const projectsFilePath = path.join(DATA_DIR, 'projects.json')
      let projects = []
      
      try {
        const projectsData = await fs.readFile(projectsFilePath, 'utf-8')
        projects = JSON.parse(projectsData)
      } catch (error) {
        // 如果文件不存在，创建空数组
        projects = []
      }
      
      // 检查项目是否已存在，如果不存在则添加
      const existingProject = projects.find((p: any) => p.id === projectId)
      if (!existingProject) {
        projects.push({ id: projectId })
        await fs.writeFile(projectsFilePath, JSON.stringify(projects, null, 2), 'utf-8')
      }
    }
    
    return NextResponse.json({
      success: true,
      data: meta,
      message: isNewProject ? '新项目创建成功' : '项目保存成功'
    })

  } catch (error) {
    console.error('保存项目失败:', error)
    return NextResponse.json(
      { success: false, error: '保存项目失败' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params

    // 检查项目目录是否存在
    const projectDir = path.join(PROJECTS_DIR, projectId)
    try {
      await fs.access(projectDir)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: '项目不存在' },
        { status: 404 }
      )
    }

    // 读取项目的 meta.json
    const metaFilePath = path.join(projectDir, 'meta.json')
    try {
      const metaData = await fs.readFile(metaFilePath, 'utf-8')
      const meta = JSON.parse(metaData)
      
      return NextResponse.json({
        success: true,
        data: meta
      })
    } catch (error) {
      console.error('读取项目信息失败:', error)
      return NextResponse.json(
        { success: false, error: '读取项目信息失败' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('获取项目失败:', error)
    return NextResponse.json(
      { success: false, error: '获取项目失败' },
      { status: 500 }
    )
  }
}
