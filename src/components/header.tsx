import { GraduationCap, HelpCircle, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 backdrop-blur-sm px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary shadow-md">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AI 工具平台
          </h1>
          <p className="text-xs text-muted-foreground">学习助手</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10 hover:text-primary">
          <HelpCircle className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10 hover:text-primary">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>偏好设置</DropdownMenuItem>
            <DropdownMenuItem>主题切换</DropdownMenuItem>
            <DropdownMenuItem>语言设置</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Avatar className="ml-2 h-8 w-8 border-2 border-transparent bg-gradient-to-br from-primary to-secondary p-[2px]">
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
