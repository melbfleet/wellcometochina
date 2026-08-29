import React from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
}

/**
 * 兼容性图片组件
 * 支持 AVIF 格式（现代浏览器）和 JPG 备选（旧浏览器）
 * 
 * 使用方式：
 * <ResponsiveImage src="/images/example.jpg" alt="描述" />
 * 
 * 会自动加载：
 * - example.avif (如果浏览器支持)
 * - example.jpg (备选方案)
 * 
 * 外部 URL 会直接使用，不进行转换
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy'
}) => {
  // 检查是否是外部 URL（http/https）
  const isExternalUrl = src.startsWith('http://') || src.startsWith('https://');
  
  // 如果是外部 URL，直接使用，不尝试转换为 AVIF
  if (isExternalUrl) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={loading}
      />
    );
  }
  
  // 本地文件：从 src 提取基础路径（去掉扩展名）
  const basePath = src.replace(/\.(jpg|jpeg|png|webp)$/i, '');
  const avifPath = `${basePath}.avif`;

  return (
    <picture>
      {/* AVIF 格式 - 现代浏览器优先加载（更小、更快） */}
      <source srcSet={avifPath} type="image/avif" />
      
      {/* JPG 备选方案 - 旧浏览器使用 */}
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={loading}
      />
    </picture>
  );
};

export default ResponsiveImage;
