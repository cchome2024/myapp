# sample-project-3 文件存储结构

## 目录说明

### uploads/ - 用户上传文件
- `files/` - 用户上传的文档文件（PDF、DOCX等）
- `images/` - 用户上传的图片文件

### generated/ - AI生成内容
- `images/` - AI生成的配图
- `slides/` - 生成的PPT图片
- `exports/` - 导出的文件（HTML、PDF等）

### temp/ - 临时文件
- 处理过程中的临时文件

## 文件命名规范
- 用户上传文件：`{timestamp}_{originalName}`
- AI生成文件：`{type}_{timestamp}_{description}`
- 临时文件：`temp_{timestamp}_{purpose}`
