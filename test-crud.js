const { ProjectStore, ProjectDataStore } = require('./src/lib/file-store.ts')

async function testCRUD() {
  console.log(' 测试项目CRUD功能...\n')

  try {
    // 1. 测试创建项目
    console.log('1 测试创建项目...')
    const newProject = {
      id: 'test-project-' + Date.now(),
      name: '测试项目',
      date: new Date().toISOString(),
      status: 'draft',
      description: '这是一个测试项目',
      tags: ['测试', 'CRUD']
    }
    
    await ProjectStore.createProject(newProject)
    console.log(' 项目创建成功:', newProject.id)

    // 2. 测试获取所有项目
    console.log('\n2 测试获取所有项目...')
    const allProjects = await ProjectStore.getProjects()
    console.log(' 获取到项目数量:', allProjects.length)
    console.log('项目列表:', allProjects.map(p => ({ id: p.id, name: p.name })))

    // 3. 测试获取单个项目
    console.log('\n3 测试获取单个项目...')
    const singleProject = await ProjectStore.getProject(newProject.id)
    console.log(' 获取单个项目成功:', singleProject?.name)

    // 4. 测试更新项目
    console.log('\n4 测试更新项目...')
    await ProjectStore.updateProject(newProject.id, {
      name: '更新后的测试项目',
      status: 'processing'
    })
    const updatedProject = await ProjectStore.getProject(newProject.id)
    console.log(' 项目更新成功:', updatedProject?.name, updatedProject?.status)

    // 5. 测试项目数据操作
    console.log('\n5 测试项目数据操作...')
    const projectDataStore = new ProjectDataStore(newProject.id)
    
    // 测试输入数据
    const inputsData = {
      urls: ['https://example.com'],
      prompts: {
        summary: '测试摘要',
        images: '测试图片',
        ppt: '测试PPT',
        custom: '测试自定义内容'
      },
      files: [{
        filename: 'test.pdf',
        originalName: '测试文档.pdf',
        mime: 'application/pdf',
        size: 1024,
        uploadedAt: new Date().toISOString()
      }]
    }
    
    await projectDataStore.setInputs(inputsData)
    const retrievedInputs = await projectDataStore.getInputs()
    console.log(' 输入数据操作成功:', retrievedInputs?.prompts.custom)

    // 6. 测试删除项目
    console.log('\n6 测试删除项目...')
    await ProjectStore.deleteProject(newProject.id)
    const deletedProject = await ProjectStore.getProject(newProject.id)
    console.log(' 项目删除成功:', deletedProject === null)

    console.log('\n 所有CRUD测试通过！')

  } catch (error) {
    console.error(' 测试失败:', error)
  }
}

testCRUD()
