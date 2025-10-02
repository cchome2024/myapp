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
    const slides = await store.getSlides()

    return NextResponse.json({
      success: true,
      data: slides
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
  } catch (error) {
    console.error("Failed to fetch slides:", error)
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch slides" } },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { projectId, slides } = body

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: { message: "Project ID is required" } },
        { status: 400 }
      )
    }

    const store = new ProjectDataStore(projectId)
    await store.setSlides(slides)

    return NextResponse.json({
      success: true,
      data: slides
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
  } catch (error) {
    console.error("Failed to save slides:", error)
    return NextResponse.json(
      { success: false, error: { message: "Failed to save slides" } },
      { status: 500 }
    )
  }
}
