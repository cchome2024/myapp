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
    const summary = await store.getSummary()

    if (!summary) {
      return NextResponse.json(
        { success: false, error: { message: "Summary not found" } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: summary
    })
  } catch (error) {
    console.error("Failed to fetch summary:", error)
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch summary" } },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { projectId, ...summaryData } = body

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: { message: "Project ID is required" } },
        { status: 400 }
      )
    }

    const store = new ProjectDataStore(projectId)
    await store.setSummary(summaryData)

    return NextResponse.json({
      success: true,
      data: summaryData
    })
  } catch (error) {
    console.error("Failed to save summary:", error)
    return NextResponse.json(
      { success: false, error: { message: "Failed to save summary" } },
      { status: 500 }
    )
  }
}
