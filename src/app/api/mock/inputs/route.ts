import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: { message: "Project ID is required" } },
        { status: 400 }
      )
    }

    const inputsPath = path.join(process.cwd(), "data", "projects", projectId, "inputs.json")
    
    try {
      const data = await fs.readFile(inputsPath, "utf-8")
      const inputs = JSON.parse(data)
      
      return NextResponse.json({
        success: true,
        data: inputs
      }, {
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      })
    } catch (fileError) {
      return NextResponse.json({
        success: true,
        data: {
          urls: [],
          prompts: {
            summary: "",
            images: "",
            ppt: "",
            custom: ""
          },
          files: []
        }
      })
    }
  } catch (error) {
    console.error("Failed to fetch inputs:", error)
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch inputs" } },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { projectId, inputs } = body

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: { message: "Project ID is required" } },
        { status: 400 }
      )
    }

    const projectDir = path.join(process.cwd(), "data", "projects", projectId)
    await fs.mkdir(projectDir, { recursive: true })

    const inputsPath = path.join(projectDir, "inputs.json")
    await fs.writeFile(inputsPath, JSON.stringify(inputs, null, 2), "utf-8")

    return NextResponse.json({
      success: true,
      data: inputs
    })
  } catch (error) {
    console.error("Failed to save inputs:", error)
    return NextResponse.json(
      { success: false, error: { message: "Failed to save inputs" } },
      { status: 500 }
    )
  }
}
