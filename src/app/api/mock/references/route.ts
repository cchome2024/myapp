import { NextResponse } from 'next/server'

export async function GET() {
  const references = [
    {
      id: '1',
      title: '机器学习',
      url: 'https://book.douban.com/subject/26708119/',
      description: '周志华教授的经典机器学习教材，系统介绍了机器学习的基本概念、原理和算法',
      source: '清华大学出版社',
      date: '2016',
    },
    {
      id: '2',
      title: 'Pattern Recognition and Machine Learning',
      url: 'https://www.springer.com/gp/book/9780387310732',
      description: 'Christopher Bishop 的经典著作，深入讲解模式识别和机器学习理论',
      source: 'Springer',
      date: '2006',
    },
    {
      id: '3',
      title: 'Deep Learning',
      url: 'https://www.deeplearningbook.org/',
      description: 'Ian Goodfellow 等人编写的深度学习权威教材',
      source: 'MIT Press',
      date: '2016',
    },
    {
      id: '4',
      title: 'Attention Is All You Need',
      url: 'https://arxiv.org/abs/1706.03762',
      description: 'Transformer 架构的开创性论文，彻底改变了自然语言处理领域',
      source: 'NeurIPS 2017',
      date: '2017',
    },
    {
      id: '5',
      title: 'ImageNet Classification with Deep CNNs',
      url: 'https://papers.nips.cc/paper/4824-imagenet-classification-with-deep-convolutional-neural-networks',
      description: 'AlexNet 论文，开启了深度学习在计算机视觉的应用热潮',
      source: 'NeurIPS 2012',
      date: '2012',
    },
    {
      id: '6',
      title: 'Coursera - Machine Learning by Andrew Ng',
      url: 'https://www.coursera.org/learn/machine-learning',
      description: 'Andrew Ng 教授的经典机器学习入门课程',
      source: 'Coursera',
      date: '2024',
    },
    {
      id: '7',
      title: 'Fast.ai - Practical Deep Learning',
      url: 'https://www.fast.ai/',
      description: '面向程序员的实践深度学习课程',
      source: 'Fast.ai',
      date: '2024',
    },
    {
      id: '8',
      title: 'Scikit-learn Documentation',
      url: 'https://scikit-learn.org/stable/',
      description: 'Python 机器学习库 Scikit-learn 的官方文档',
      source: 'Scikit-learn',
      date: '2024',
    },
  ]

  return NextResponse.json({
    success: true,
    data: references,
  })
} 