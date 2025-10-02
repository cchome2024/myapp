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
    const quizData = await store.getQuiz()

    if (!quizData) {
      return NextResponse.json(
        { success: false, error: { message: "Quiz not found" } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: quizData
    })
  } catch (error) {
    console.error("Failed to fetch quiz:", error)
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch quiz" } },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const store = new ProjectDataStore(body.projectId)
    await store.setQuiz(body)
    
    return NextResponse.json({ 
      success: true, 
      data: body 
    })
  } catch (error) {
    console.error("Failed to save quiz:", error)
    return NextResponse.json(
      { success: false, error: { message: "Failed to save quiz" } },
      { status: 500 }
    )
  }
}
