import { NextResponse } from "next/server"
import { ProjectDataStore } from "@/lib/file-store"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: { message: "Project ID is required" } },
        { status: 400 }
      )
    }

    const store = new ProjectDataStore(projectId)
    const manifest = await store.getPublishManifest("xiaohongshu")

    if (!manifest) {
      return NextResponse.json(
        { success: false, error: { message: "Xiaohongshu manifest not found" } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: manifest
    })
  } catch (error) {
    console.error("Failed to fetch xiaohongshu manifest:", error)
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch xiaohongshu manifest" } },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { projectId, manifest } = body

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: { message: "Project ID is required" } },
        { status: 400 }
      )
    }

    const store = new ProjectDataStore(projectId)
    await store.setPublishManifest("xiaohongshu", manifest)

    return NextResponse.json({
      success: true,
      data: manifest
    })
  } catch (error) {
    console.error("Failed to save xiaohongshu manifest:", error)
    return NextResponse.json(
      { success: false, error: { message: "Failed to save xiaohongshu manifest" } },
      { status: 500 }
    )
  }
}
