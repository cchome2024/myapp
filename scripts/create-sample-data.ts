import { ProjectStore, ProjectDataStore } from "../src/lib/file-store"
import { Project, Summary, QuizQuestion, ImageData, SlideData, Inputs, PublishManifest } from "../src/lib/schemas"

// 创建示例项目
async function createSampleProject() {
  const projectId = "sample-project-1"
  const now = new Date().toISOString()
  
  // 创建项目
  const project: Project = {
    id: projectId,
    name: "数据科学项目",
    date: now,
    status: "complete",
    createdAt: now,
    updatedAt: now
  }
  
  await ProjectStore.createProject(project)
  
  // 创建项目数据存储
  const store = new ProjectDataStore(projectId)
  
  // 设置摘要
  const summary: Summary = {
    text: "# 数据科学项目\n\n这是一个关于数据科学的综合项目，涵盖了数据清洗、特征工程、模型训练和评估等关键步骤。\n\n## 核心概念\n- 数据预处理\n- 特征选择\n- 模型评估\n- 交叉验证\n\n## 结果\n- 达到95%准确率\n- 减少过拟合\n- 提高泛化能力",
    html: "<h1>数据科学项目</h1><p>这是一个关于数据科学的综合项目，涵盖了数据清洗、特征工程、模型训练和评估等关键步骤。</p><h2>核心概念</h2><ul><li>数据预处理</li><li>特征选择</li><li>模型评估</li><li>交叉验证</li></ul><h2>结果</h2><ul><li>达到95%准确率</li><li>减少过拟合</li><li>提高泛化能力</li></ul>"
  }
  await store.setSummary(summary)
  
  // 设置测验
  const quiz: QuizQuestion[] = [
    {
      id: "q1",
      question: "什么是机器学习？",
      options: ["一种数据库类型", "AI的子集", "编程语言", "硬件组件"],
      correctAnswer: 1,
      explanation: "机器学习是人工智能的一个子集，专注于算法。"
    },
    {
      id: "q2",
      question: "哪个是监督学习的例子？",
      options: ["聚类", "分类", "降维", "关联规则"],
      correctAnswer: 1,
      explanation: "分类是监督学习任务，我们预测分类标签。"
    },
    {
      id: "q3",
      question: "什么是过拟合？",
      options: ["模型太简单", "模型太复杂", "数据不足", "算法错误"],
      correctAnswer: 1,
      explanation: "过拟合发生在模型过于复杂并记忆训练数据时。"
    }
  ]
  await store.setQuiz(quiz)
  
  // 设置图片
  const images: ImageData[] = [
    {
      id: "img1",
      url: "https://picsum.photos/400/300?random=1",
      title: "机器学习概览",
      description: "机器学习概念和应用的概览图",
      category: "概览"
    },
    {
      id: "img2",
      url: "https://picsum.photos/400/300?random=2",
      title: "深度学习架构",
      description: "深度学习和神经网络架构图",
      category: "架构"
    },
    {
      id: "img3",
      url: "https://picsum.photos/400/300?random=3",
      title: "数据处理流程",
      description: "数据预处理和特征工程流程图",
      category: "流程"
    }
  ]
  await store.setImages(images)
  
  // 设置幻灯片
  const slides: SlideData[] = [
    {
      id: "slide1",
      title: "机器学习介绍",
      thumbnail: "https://picsum.photos/300/200?random=10",
      content: "机器学习的基本概念和应用介绍",
      order: 1
    },
    {
      id: "slide2",
      title: "监督学习",
      thumbnail: "https://picsum.photos/300/200?random=11",
      content: "理解监督学习算法",
      order: 2
    },
    {
      id: "slide3",
      title: "无监督学习",
      thumbnail: "https://picsum.photos/300/200?random=12",
      content: "探索无监督学习技术",
      order: 3
    }
  ]
  await store.setSlides(slides)
  
  // 设置输入数据
  const inputs: Inputs = {
    urls: [
      "https://example.com/tutorial1",
      "https://example.com/documentation",
      "https://example.com/code-repo",
      "https://example.com/paper"
    ],
    prompts: {
      summary: "请生成一个关于数据科学的详细摘要",
      images: "请生成相关的图表和示意图",
      ppt: "请创建演示文稿",
      custom: "自定义内容要求"
    },
    files: [
      {
        filename: "learning-materials.pdf",
        originalName: "学习资料.pdf",
        mime: "application/pdf",
        size: 2500000,
        uploadedAt: now
      },
      {
        filename: "code-examples.zip",
        originalName: "代码示例.zip",
        mime: "application/zip",
        size: 1200000,
        uploadedAt: now
      },
      {
        filename: "dataset.csv",
        originalName: "数据集.csv",
        mime: "text/csv",
        size: 5800000,
        uploadedAt: now
      }
    ]
  }
  await store.setInputs(inputs)
  
  // 设置小红书发布清单
  const xiaohongshuManifest: PublishManifest = {
    platform: "xiaohongshu",
    title: "数据科学学习笔记 ",
    cover: "cover.jpg",
    summary: "分享我的数据科学学习心得，从基础概念到实际应用，干货满满！",
    sections: [
      {
        heading: "什么是数据科学？",
        text: "数据科学是一个跨学科领域，结合了统计学、计算机科学和领域专业知识来从数据中提取见解。",
        html: "<h3>什么是数据科学？</h3><p>数据科学是一个跨学科领域，结合了统计学、计算机科学和领域专业知识来从数据中提取见解。</p>"
      },
      {
        heading: "核心技能",
        text: "1. 数据清洗和预处理\n2. 特征工程\n3. 模型选择和训练\n4. 结果解释和可视化",
        html: "<h3>核心技能</h3><ol><li>数据清洗和预处理</li><li>特征工程</li><li>模型选择和训练</li><li>结果解释和可视化</li></ol>"
      }
    ],
    images: [
      { path: "data-science-overview.jpg", alt: "数据科学概览图" },
      { path: "ml-workflow.jpg", alt: "机器学习工作流程" }
    ],
    tags: ["数据科学", "机器学习", "Python", "数据分析", "AI"],
    status: "draft"
  }
  await store.setPublishManifest("xiaohongshu", xiaohongshuManifest)
  
  console.log("示例项目创建完成！")
}

// 运行创建函数
createSampleProject().catch(console.error)
