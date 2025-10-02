import { NextResponse } from "next/server"
import { ProjectStore, ProjectDataStore } from "@/lib/file-store"
import { Project } from "@/lib/schemas"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (projectId) {
      // 获取特定项目的元数据
      const projectDataStore = new ProjectDataStore(projectId)
      const meta = await projectDataStore.getMeta()
      
      if (!meta) {
        return NextResponse.json(
          { success: false, error: { message: "Project not found" } },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ 
        success: true, 
        data: [meta] 
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      })
    } else {
      // 获取所有项目
      const projects = await ProjectStore.getProjects()
      return NextResponse.json({ 
        success: true, 
        data: projects 
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      })
    }
  } catch (error) {
    console.error("Failed to fetch projects:", error)
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch projects" } },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const project = Project.parse(body)
    
    await ProjectStore.createProject(project)
    const projectDataStore = new ProjectDataStore(project.id)
    await projectDataStore.setMeta(project)
    
    return NextResponse.json({ 
      success: true, 
      data: project 
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
  } catch (error) {
    console.error("Failed to create project:", error)
    return NextResponse.json(
      { success: false, error: { message: "Failed to create project" } },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    
    if (!projectId) {
      return NextResponse.json(
        { success: false, error: { message: "Project ID is required" } },
        { status: 400 }
      )
    }

    const body = await request.json()
    const updates = Project.partial().parse(body)
    
    // 更新项目元数据
    await ProjectStore.updateProject(projectId, updates)
    
    // 如果更新了基本信息，也更新meta.json
    if (Object.keys(updates).length > 0) {
      const projectDataStore = new ProjectDataStore(projectId)
      const currentMeta = await projectDataStore.getMeta()
      if (currentMeta) {
        const updatedMeta = { ...currentMeta, ...updates }
        await projectDataStore.setMeta(updatedMeta)
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      data: { id: projectId, ...updates }
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
  } catch (error) {
    console.error("Failed to update project:", error)
    return NextResponse.json(
      { success: false, error: { message: "Failed to update project" } },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    
    if (!projectId) {
      return NextResponse.json(
        { success: false, error: { message: "Project ID is required" } },
        { status: 400 }
      )
    }

    // 删除项目
    await ProjectStore.deleteProject(projectId)
    
    // 删除项目目录及其所有文件
    const { promises: fs } = await import("fs")
    const path = await import("path")
    const projectDir = path.join(process.cwd(), "data", "projects", projectId)
    
    try {
      await fs.rm(projectDir, { recursive: true, force: true })
    } catch (error) {
      console.warn("Failed to delete project directory:", error)
      // 即使删除目录失败，也认为项目删除成功
    }
    
    return NextResponse.json({ 
      success: true, 
      data: { id: projectId, deleted: true }
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
  } catch (error) {
    console.error("Failed to delete project:", error)
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete project" } },
      { status: 500 }
    )
  }
}
