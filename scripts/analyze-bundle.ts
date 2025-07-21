#!/usr/bin/env tsx

import { execSync } from 'node:child_process';
import { existsSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

interface BundleAnalysis {
  timestamp: string;
  chunks: ChunkInfo[];
  cssFiles: FileInfo[];
  totalSize: string;
  summary: BundleSummary;
}

interface ChunkInfo {
  name: string;
  size: string;
  sizeBytes: number;
  type: 'vendor' | 'ui' | 'radix' | 'icons' | 'app' | 'other';
}

interface FileInfo {
  name: string;
  size: string;
  sizeBytes: number;
}

interface BundleSummary {
  totalChunks: number;
  totalCSS: number;
  largestChunk: ChunkInfo | null;
  vendorChunksTotal: number;
  uiChunksTotal: number;
}

class BundleAnalyzer {
  private readonly projectRoot: string;
  private readonly nextDir: string;
  private readonly docsDir: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.nextDir = join(this.projectRoot, '.next');
    this.docsDir = join(this.projectRoot, 'docs');
  }

  async analyze(): Promise<void> {
    console.log('🔍 开始分析包大小...\n');

    // 检查 .next 目录
    if (!existsSync(this.nextDir)) {
      console.log('⚠️  .next 目录不存在，开始构建...');
      this.runBuild();
    }

    // 运行 Bundle Analyzer
    console.log('📊 运行 Bundle Analyzer...');
    this.runAnalyzer();

    // 分析文件
    console.log('📈 分析文件大小...');
    const analysis = this.analyzeFiles();

    // 生成报告
    console.log('📄 生成分析报告...');
    this.generateReport(analysis);

    // 检查大小限制
    console.log('✅ 检查大小限制...');
    this.checkSizeLimits();

    console.log('\n📋 分析完成！');
    console.log('📄 查看 docs/bundle-size-report.txt 获取详细信息');
    console.log('🌐 Bundle Analyzer 报告已保存到 .next/analyze/ 目录');
  }

  private runBuild(): void {
    try {
      execSync('pnpm build', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ 构建失败:', error);
      process.exit(1);
    }
  }

  private runAnalyzer(): void {
    try {
      execSync('ANALYZE=true pnpm build', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Bundle Analyzer 运行失败:', error);
      process.exit(1);
    }
  }

  private analyzeFiles(): BundleAnalysis {
    const clientChunksDir = join(this.nextDir, 'static', 'chunks');
    const serverChunksDir = join(this.nextDir, 'server', 'chunks');
    const cssDir = join(this.nextDir, 'static', 'css');

    const clientChunks = this.analyzeChunks(clientChunksDir, 'client');
    const serverChunks = this.analyzeChunks(serverChunksDir, 'server');
    const chunks = [...clientChunks, ...serverChunks];
    const cssFiles = this.analyzeCSSFiles(cssDir);
    const totalSize = this.getTotalSize();

    const summary = this.generateSummary(chunks, cssFiles);

    return {
      timestamp: new Date().toLocaleString('zh-CN'),
      chunks,
      cssFiles,
      totalSize,
      summary,
    };
  }

  private analyzeChunks(chunksDir: string, location: 'client' | 'server' = 'client'): ChunkInfo[] {
    if (!existsSync(chunksDir)) {
      return [];
    }

    const chunks: ChunkInfo[] = [];
    const files = readdirSync(chunksDir);

    for (const file of files) {
      const filePath = join(chunksDir, file);
      const stats = statSync(filePath);

      if (stats.isFile() && file.endsWith('.js')) {
        const sizeBytes = stats.size;
        const size = this.formatSize(sizeBytes);
        const type = this.determineChunkType(file);

        chunks.push({
          name: `${location === 'server' ? '[SERVER] ' : ''}${file}`,
          size,
          sizeBytes,
          type,
        });
      }
    }

    // 按大小排序
    return chunks.sort((a, b) => b.sizeBytes - a.sizeBytes);
  }

  private analyzeCSSFiles(cssDir: string): FileInfo[] {
    if (!existsSync(cssDir)) {
      return [];
    }

    const cssFiles: FileInfo[] = [];
    const files = readdirSync(cssDir);

    for (const file of files) {
      const filePath = join(cssDir, file);
      const stats = statSync(filePath);

      if (stats.isFile() && file.endsWith('.css')) {
        const sizeBytes = stats.size;
        const size = this.formatSize(sizeBytes);

        cssFiles.push({
          name: file,
          size,
          sizeBytes,
        });
      }
    }

    return cssFiles.sort((a, b) => b.sizeBytes - a.sizeBytes);
  }

  private determineChunkType(filename: string): ChunkInfo['type'] {
    if (filename.includes('vendors-')) return 'vendor';
    if (filename.includes('ui-components-')) return 'ui';
    if (filename.includes('radix-ui-')) return 'radix';
    if (filename.includes('icons-')) return 'icons';
    if (filename.includes('app/')) return 'app';
    return 'other';
  }

  private getTotalSize(): string {
    try {
      const output = execSync(`du -sh ${this.nextDir}`, { encoding: 'utf8' });
      return output.split('\t')[0] || 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  private generateSummary(chunks: ChunkInfo[], cssFiles: FileInfo[]): BundleSummary {
    const vendorChunks = chunks.filter(c => c.type === 'vendor');
    const uiChunks = chunks.filter(c => c.type === 'ui' || c.type === 'radix');
    
    return {
      totalChunks: chunks.length,
      totalCSS: cssFiles.length,
      largestChunk: chunks[0] || null,
      vendorChunksTotal: vendorChunks.reduce((sum, c) => sum + c.sizeBytes, 0),
      uiChunksTotal: uiChunks.reduce((sum, c) => sum + c.sizeBytes, 0),
    };
  }

  private generateReport(analysis: BundleAnalysis): void {
    // 确保 docs 目录存在
    if (!existsSync(this.docsDir)) {
      execSync(`mkdir -p ${this.docsDir}`);
    }

    const reportPath = join(this.docsDir, 'bundle-size-report.txt');
    
    let report = '=== Bundle Size Analysis Report ===\n';
    report += `Generated on: ${analysis.timestamp}\n\n`;

    // 摘要信息
    report += '📊 Summary:\n';
    report += `- Total Chunks: ${analysis.summary.totalChunks}\n`;
    report += `- Total CSS Files: ${analysis.summary.totalCSS}\n`;
    report += `- Largest Chunk: ${analysis.summary.largestChunk?.name || 'N/A'} (${analysis.summary.largestChunk?.size || 'N/A'})\n`;
    report += `- Vendor Chunks Total: ${this.formatSize(analysis.summary.vendorChunksTotal)}\n`;
    report += `- UI Chunks Total: ${this.formatSize(analysis.summary.uiChunksTotal)}\n`;
    report += `- Total .next Directory: ${analysis.totalSize}\n\n`;

    // 按类型分组的 Chunks
    const chunksByType = this.groupChunksByType(analysis.chunks);
    
    for (const [type, chunks] of Object.entries(chunksByType)) {
      if (chunks.length > 0) {
        report += `📦 ${this.getTypeDisplayName(type)} Chunks:\n`;
        for (const chunk of chunks) {
          report += `  ${chunk.size.padStart(8)} - ${chunk.name}\n`;
        }
        report += '\n';
      }
    }

    // CSS 文件
    if (analysis.cssFiles.length > 0) {
      report += '🎨 CSS Files:\n';
      for (const file of analysis.cssFiles) {
        report += `  ${file.size.padStart(8)} - ${file.name}\n`;
      }
      report += '\n';
    }

    // 优化建议
    report += this.generateOptimizationSuggestions(analysis);

    writeFileSync(reportPath, report, 'utf8');
    console.log(`📄 报告已保存到: ${reportPath}`);
  }

  private groupChunksByType(chunks: ChunkInfo[]): Record<string, ChunkInfo[]> {
    return chunks.reduce((groups, chunk) => {
      if (!groups[chunk.type]) {
        groups[chunk.type] = [];
      }
      groups[chunk.type].push(chunk);
      return groups;
    }, {} as Record<string, ChunkInfo[]>);
  }

  private getTypeDisplayName(type: string): string {
    const names: Record<string, string> = {
      vendor: 'Third-party Libraries',
      ui: 'UI Components',
      radix: 'Radix UI Components',
      icons: 'Icon Libraries',
      app: 'Application Code',
      other: 'Other',
    };
    return names[type] || type;
  }

  private generateOptimizationSuggestions(analysis: BundleAnalysis): string {
    let suggestions = '💡 Optimization Suggestions:\n\n';

    // 检查大型 vendor chunks
    const largeVendorChunks = analysis.chunks.filter(
      c => c.type === 'vendor' && c.sizeBytes > 100 * 1024 // > 100KB
    );

    if (largeVendorChunks.length > 0) {
      suggestions += '⚠️  Large Vendor Chunks Found:\n';
      for (const chunk of largeVendorChunks.slice(0, 3)) {
        suggestions += `  - ${chunk.name} (${chunk.size}) - Consider code splitting or lazy loading\n`;
      }
      suggestions += '\n';
    }

    // 检查 CSS 大小
    const largeCSSFiles = analysis.cssFiles.filter(f => f.sizeBytes > 50 * 1024); // > 50KB
    if (largeCSSFiles.length > 0) {
      suggestions += '⚠️  Large CSS Files Found:\n';
      for (const file of largeCSSFiles) {
        suggestions += `  - ${file.name} (${file.size}) - Consider CSS optimization\n`;
      }
      suggestions += '\n';
    }

    // 通用建议
    suggestions += '✅ General Recommendations:\n';
    suggestions += '  - Use dynamic imports for large components\n';
    suggestions += '  - Implement code splitting for route-based chunks\n';
    suggestions += '  - Consider tree shaking for unused exports\n';
    suggestions += '  - Optimize images and static assets\n';

    return suggestions;
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
  }

  private checkSizeLimits(): void {
    try {
      execSync('pnpm size-check', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  bundlesize 检查失败或未配置');
    }
  }
}

// 主函数
async function main() {
  try {
    const analyzer = new BundleAnalyzer();
    await analyzer.analyze();
  } catch (error) {
    console.error('❌ 分析失败:', error);
    process.exit(1);
  }
}

// 直接运行主函数
main(); 