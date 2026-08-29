import React from 'react';

// 导入 Google Fonts
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Poppins:wght@400;500;600&family=Raleway:wght@400;600;700&family=Lato:wght@400;500;700&family=Playfair+Display:wght@400;600;700&family=Cormorant+Garamond:wght@400;500;600&family=Space+Mono:wght@400;700&family=Crimson+Text:wght@400;600&display=swap';
fontLink.rel = 'stylesheet';
if (!document.head.querySelector('link[href*="fonts.googleapis.com"]')) {
  document.head.appendChild(fontLink);
}

export default function FontShowcase() {
  const fonts = [
    {
      name: 'Montserrat',
      family: 'Montserrat',
      description: '现代几何无衬线字体，简洁有力，适合标题和标签',
      preview: {
        destinations: 'DESTINATIONS',
        title: 'GUILIN',
        description: 'Misty karst mountains and serene rivers. Ancient landscape where nature paints with mist and stone.',
        explore: 'EXPLORE →'
      }
    },
    {
      name: 'Poppins',
      family: 'Poppins',
      description: '友好现代的无衬线字体，圆润柔和，易读性强',
      preview: {
        destinations: 'DESTINATIONS',
        title: 'GUILIN',
        description: 'Misty karst mountains and serene rivers. Ancient landscape where nature paints with mist and stone.',
        explore: 'EXPLORE →'
      }
    },
    {
      name: 'Raleway',
      family: 'Raleway',
      description: '优雅细长的无衬线字体，高级感强，适合奢侈品牌',
      preview: {
        destinations: 'DESTINATIONS',
        title: 'GUILIN',
        description: 'Misty karst mountains and serene rivers. Ancient landscape where nature paints with mist and stone.',
        explore: 'EXPLORE →'
      }
    },
    {
      name: 'Lato',
      family: 'Lato',
      description: '温暖友好的无衬线字体，现代感十足，高可读性',
      preview: {
        destinations: 'DESTINATIONS',
        title: 'GUILIN',
        description: 'Misty karst mountains and serene rivers. Ancient landscape where nature paints with mist and stone.',
        explore: 'EXPLORE →'
      }
    },
    {
      name: 'Playfair Display',
      family: 'Playfair Display',
      description: '高对比度衬线字体，优雅高贵，适合标题',
      preview: {
        destinations: 'DESTINATIONS',
        title: 'GUILIN',
        description: 'Misty karst mountains and serene rivers. Ancient landscape where nature paints with mist and stone.',
        explore: 'EXPLORE →'
      }
    },
    {
      name: 'Cormorant Garamond',
      family: 'Cormorant Garamond',
      description: '精致衬线字体，奢华气质，适合高端品牌',
      preview: {
        destinations: 'DESTINATIONS',
        title: 'GUILIN',
        description: 'Misty karst mountains and serene rivers. Ancient landscape where nature paints with mist and stone.',
        explore: 'EXPLORE →'
      }
    },
    {
      name: 'Space Mono',
      family: 'Space Mono',
      description: '等宽单间距字体，现代极简，科技感强',
      preview: {
        destinations: 'DESTINATIONS',
        title: 'GUILIN',
        description: 'Misty karst mountains and serene rivers. Ancient landscape where nature paints with mist and stone.',
        explore: 'EXPLORE →'
      }
    },
    {
      name: 'Crimson Text',
      family: 'Crimson Text',
      description: '经典衬线字体，书籍感强，优雅传统',
      preview: {
        destinations: 'DESTINATIONS',
        title: 'GUILIN',
        description: 'Misty karst mountains and serene rivers. Ancient landscape where nature paints with mist and stone.',
        explore: 'EXPLORE →'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">字体选择展示</h1>
        <p className="text-gray-300 mb-12">选择与您图片风格相似的字体。点击任意卡片查看详细信息。</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {fonts.map((font, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-8 border border-slate-600 hover:border-slate-400 transition-all duration-300"
            >
              {/* 字体名称 */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">{font.name}</h2>
                <p className="text-gray-400 text-sm">{font.description}</p>
              </div>

              {/* 预览区域 */}
              <div
                style={{ fontFamily: font.family }}
                className="bg-black/40 rounded p-6 space-y-4 border border-slate-600"
              >
                {/* DESTINATIONS 标签 */}
                <div className="text-xs tracking-widest text-gray-300 uppercase">
                  {font.preview.destinations}
                </div>

                {/* 标题 */}
                <div className="text-3xl font-semibold text-white">
                  {font.preview.title}
                </div>

                {/* 描述文字 */}
                <div className="text-sm text-gray-200 leading-relaxed">
                  {font.preview.description}
                </div>

                {/* EXPLORE 按钮 */}
                <div className="pt-2">
                  <button className="text-xs tracking-widest text-white uppercase border-b border-white/60 pb-1 hover:border-white transition-colors">
                    {font.preview.explore}
                  </button>
                </div>
              </div>

              {/* 字体信息 */}
              <div className="mt-4 text-xs text-gray-400 space-y-1">
                <p>• 字体系列: {font.family}</p>
                <p>• 推荐用途: 标题、描述、按钮</p>
              </div>
            </div>
          ))}
        </div>

        {/* 返回按钮 */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-[#F5F3EF] text-slate-900 rounded font-semibold hover:bg-gray-100 transition-colors"
          >
            返回主页
          </a>
        </div>
      </div>
    </div>
  );
}
