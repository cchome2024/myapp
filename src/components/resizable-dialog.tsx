"use client"

import type React from "react"

import { useState, useRef, useEffect, type ReactNode } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ResizableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  defaultWidth?: number
  defaultHeight?: number
}

export function ResizableDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  defaultWidth = 1000,
  defaultHeight = 700,
}: ResizableDialogProps) {
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight })
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string>("")
  const dialogRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const resizeStartRef = useRef({ width: 0, height: 0, x: 0, y: 0 })

  // Center dialog on open
  useEffect(() => {
    if (open) {
      const centerX = (window.innerWidth - size.width) / 2
      const centerY = (window.innerHeight - size.height) / 2
      setPosition({ x: Math.max(0, centerX), y: Math.max(0, centerY) })
    }
  }, [open, size.width, size.height])

  const handleMouseDown = (e: React.MouseEvent, action: "drag" | "resize", direction?: string) => {
    e.preventDefault()
    if (action === "drag") {
      setIsDragging(true)
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      }
    } else if (action === "resize" && direction) {
      setIsResizing(true)
      setResizeDirection(direction)
      resizeStartRef.current = {
        width: size.width,
        height: size.height,
        x: e.clientX,
        y: e.clientY,
      }
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStartRef.current.x
        const newY = e.clientY - dragStartRef.current.y
        setPosition({
          x: Math.max(0, Math.min(newX, window.innerWidth - size.width)),
          y: Math.max(0, Math.min(newY, window.innerHeight - size.height)),
        })
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStartRef.current.x
        const deltaY = e.clientY - resizeStartRef.current.y

        let newWidth = resizeStartRef.current.width
        let newHeight = resizeStartRef.current.height
        let newX = position.x
        let newY = position.y

        if (resizeDirection.includes("e")) {
          newWidth = Math.max(600, Math.min(resizeStartRef.current.width + deltaX, window.innerWidth - position.x))
        }
        if (resizeDirection.includes("s")) {
          newHeight = Math.max(400, Math.min(resizeStartRef.current.height + deltaY, window.innerHeight - position.y))
        }
        if (resizeDirection.includes("w")) {
          const widthChange = resizeStartRef.current.width - deltaX
          if (widthChange >= 600 && position.x + deltaX >= 0) {
            newWidth = widthChange
            newX = position.x + deltaX
          }
        }
        if (resizeDirection.includes("n")) {
          const heightChange = resizeStartRef.current.height - deltaY
          if (heightChange >= 400 && position.y + deltaY >= 0) {
            newHeight = heightChange
            newY = position.y + deltaY
          }
        }

        setSize({ width: newWidth, height: newHeight })
        setPosition({ x: newX, y: newY })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
      setResizeDirection("")
    }

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, isResizing, position, size, resizeDirection])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/50" onClick={() => onOpenChange(false)} />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="fixed z-50 flex flex-col overflow-hidden rounded-lg border bg-background shadow-2xl"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
        }}
      >
        {/* Header - Draggable */}
        <div
          className="flex shrink-0 cursor-move items-center justify-between border-b bg-gradient-to-r from-pink-50 to-orange-50 px-6 py-4"
          onMouseDown={(e) => handleMouseDown(e, "drag")}
        >
          <div>
            <h2 className="font-semibold text-lg">{title}</h2>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">{children}</div>

        {/* Footer */}
        {footer && <div className="shrink-0 border-t bg-background px-6 py-4">{footer}</div>}

        {/* Resize Handles */}
        <div
          className="absolute top-0 right-0 h-full w-2 cursor-ew-resize"
          onMouseDown={(e) => handleMouseDown(e, "resize", "e")}
        />
        <div
          className="absolute bottom-0 left-0 h-2 w-full cursor-ns-resize"
          onMouseDown={(e) => handleMouseDown(e, "resize", "s")}
        />
        <div
          className="absolute top-0 left-0 h-full w-2 cursor-ew-resize"
          onMouseDown={(e) => handleMouseDown(e, "resize", "w")}
        />
        <div
          className="absolute top-0 left-0 h-2 w-full cursor-ns-resize"
          onMouseDown={(e) => handleMouseDown(e, "resize", "n")}
        />
        <div
          className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize"
          onMouseDown={(e) => handleMouseDown(e, "resize", "se")}
        />
        <div
          className="absolute bottom-0 left-0 h-4 w-4 cursor-nesw-resize"
          onMouseDown={(e) => handleMouseDown(e, "resize", "sw")}
        />
        <div
          className="absolute top-0 right-0 h-4 w-4 cursor-nesw-resize"
          onMouseDown={(e) => handleMouseDown(e, "resize", "ne")}
        />
        <div
          className="absolute top-0 left-0 h-4 w-4 cursor-nwse-resize"
          onMouseDown={(e) => handleMouseDown(e, "resize", "nw")}
        />
      </div>
    </>
  )
}
