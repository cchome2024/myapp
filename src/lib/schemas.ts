import { z } from "zod"

// 项目状态枚举
export const ProjectStatus = z.enum(["draft", "processing", "complete", "error"])

// 图片风格枚举
export const ImageStyle = z.enum(["academic", "flat", "realistic", "wireframe"])

// 语言枚举
export const Language = z.enum(["zh", "en"])

// 摘要级别枚举
export const SummaryLevel = z.enum(["chapter", "global", "both"])

// 发布平台枚举
export const PublishPlatform = z.enum(["xiaohongshu", "wechat_mp", "bilibili", "douyin"])

// 发布状态枚举
export const PublishStatus = z.enum(["draft", "ready", "published"])

// 项目基本信息
export const Project = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string(), // ISO string
  status: ProjectStatus,
  createdAt: z.string(), // ISO string
  updatedAt: z.string(), // ISO string
})

// 生成配置
export const GenerationConfig = z.object({
  webSearchEnabled: z.boolean(),
  generatePPT: z.boolean(),
  autoImages: z.boolean(),
  imageStyle: ImageStyle,
  language: Language,
  summaryLevel: SummaryLevel,
  quizCount: z.number(),
})

// 摘要数据
export const Summary = z.object({
  text: z.string(),
  html: z.string(),
})

// 测验问题
export const QuizQuestion = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.number(),
  explanation: z.string(),
})

// 图片数据
export const ImageData = z.object({
  id: z.string(),
  url: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
})

// 幻灯片数据
export const SlideData = z.object({
  id: z.string(),
  title: z.string(),
  thumbnail: z.string(),
  content: z.string(),
  order: z.number(),
})

// 用户输入数据
export const Inputs = z.object({
  urls: z.array(z.string()),
  prompts: z.object({
    summary: z.string().optional(),
    images: z.string().optional(),
    ppt: z.string().optional(),
    custom: z.string().optional(),
  }),
  files: z.array(z.object({
    filename: z.string(), // 保存到 /uploads/ 的落地名（唯一）
    originalName: z.string().optional(), // 用户本地原名
    mime: z.string().optional(),
    size: z.number().optional(), // 字节
    uploadedAt: z.string().optional(), // ISO
  })),
})

// 发布清单
export const PublishManifest = z.object({
  platform: PublishPlatform,
  title: z.string(),
  cover: z.string().optional(), // 相对路径：publish/<platform>/assets/...
  summary: z.string().optional(), // 简述/导语
  sections: z.array(z.object({
    heading: z.string().optional(),
    html: z.string().optional(),
    text: z.string().optional(),
  })).optional(),
  images: z.array(z.object({
    path: z.string(), // 文章内配图，相对路径
    alt: z.string().optional(),
  })).optional(),
  tags: z.array(z.string()).optional(), // 话题/标签（小红书可用）
  scheduledAt: z.string().optional(), // 计划发布时间(ISO)
  poi: z.string().optional(), // 平台特有字段（小红书可选）
  status: PublishStatus.optional(),
})

// 类型导出
export type Project = z.infer<typeof Project>
export type GenerationConfig = z.infer<typeof GenerationConfig>
export type Summary = z.infer<typeof Summary>
export type QuizQuestion = z.infer<typeof QuizQuestion>
export type ImageData = z.infer<typeof ImageData>
export type SlideData = z.infer<typeof SlideData>
export type Inputs = z.infer<typeof Inputs>
export type PublishManifest = z.infer<typeof PublishManifest>
