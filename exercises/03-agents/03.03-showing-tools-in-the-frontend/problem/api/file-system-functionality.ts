import * as fs from 'fs';
import * as path from 'path';

// 所有文件系统操作的根目录
const BASE_DIR = path.join(
  process.cwd(),
  'data',
  'file-system-db.local',
);

// 确保根目录存在
function ensureBaseDir(): void {
  if (!fs.existsSync(BASE_DIR)) {
    fs.mkdirSync(BASE_DIR, { recursive: true });
  }
}

// 校验路径是否在允许的目录内
function validatePath(filePath: string): string {
  const normalizedPath = path.normalize(filePath);
  const fullPath = path.resolve(BASE_DIR, normalizedPath);
  const baseDirResolved = path.resolve(BASE_DIR);

  if (!fullPath.startsWith(baseDirResolved)) {
    throw new Error(
      `访问被拒绝:路径 "${filePath}" 在允许的目录之外`,
    );
  }

  return fullPath;
}

// 获取相对于根目录的相对路径
function getRelativePath(fullPath: string): string {
  const baseDirResolved = path.resolve(BASE_DIR);
  return path.relative(baseDirResolved, fullPath);
}

/**
 * 将内容写入文件
 */
export function writeFile(
  filePath: string,
  content: string,
): { success: boolean; message: string; path: string } {
  try {
    ensureBaseDir();
    const fullPath = validatePath(filePath);

    // 确保目录存在
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, content, 'utf8');

    return {
      success: true,
      message: `文件写入成功:${getRelativePath(fullPath)}`,
      path: getRelativePath(fullPath),
    };
  } catch (error) {
    return {
      success: false,
      message: `写入文件出错:${error instanceof Error ? error.message : '未知错误'}`,
      path: filePath,
    };
  }
}

/**
 * 从文件读取内容
 */
export function readFile(filePath: string): {
  success: boolean;
  content?: string;
  message: string;
  path: string;
} {
  try {
    ensureBaseDir();
    const fullPath = validatePath(filePath);

    if (!fs.existsSync(fullPath)) {
      return {
        success: false,
        message: `文件未找到:${getRelativePath(fullPath)}`,
        path: getRelativePath(fullPath),
      };
    }

    const content = fs.readFileSync(fullPath, 'utf8');

    return {
      success: true,
      content,
      message: `文件读取成功:${getRelativePath(fullPath)}`,
      path: getRelativePath(fullPath),
    };
  } catch (error) {
    return {
      success: false,
      message: `读取文件出错:${error instanceof Error ? error.message : '未知错误'}`,
      path: filePath,
    };
  }
}

/**
 * 删除文件或目录
 */
export function deletePath(pathToDelete: string): {
  success: boolean;
  message: string;
  path: string;
} {
  try {
    ensureBaseDir();
    const fullPath = validatePath(pathToDelete);

    if (!fs.existsSync(fullPath)) {
      return {
        success: false,
        message: `路径未找到:${getRelativePath(fullPath)}`,
        path: getRelativePath(fullPath),
      };
    }

    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      return {
        success: true,
        message: `目录删除成功:${getRelativePath(fullPath)}`,
        path: getRelativePath(fullPath),
      };
    } else if (stats.isFile()) {
      fs.unlinkSync(fullPath);
      return {
        success: true,
        message: `文件删除成功:${getRelativePath(fullPath)}`,
        path: getRelativePath(fullPath),
      };
    } else {
      return {
        success: false,
        message: `路径既不是文件也不是目录:${getRelativePath(fullPath)}`,
        path: getRelativePath(fullPath),
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `删除路径出错:${error instanceof Error ? error.message : '未知错误'}`,
      path: pathToDelete,
    };
  }
}

/**
 * 列出目录内容
 */
export function listDirectory(dirPath: string = '.'): {
  success: boolean;
  items?: Array<{
    name: string;
    type: 'file' | 'directory';
    size?: number;
  }>;
  message: string;
  path: string;
} {
  try {
    ensureBaseDir();
    const fullPath = validatePath(dirPath);

    if (!fs.existsSync(fullPath)) {
      return {
        success: false,
        message: `目录未找到:${getRelativePath(fullPath)}`,
        path: getRelativePath(fullPath),
      };
    }

    const stats = fs.statSync(fullPath);
    if (!stats.isDirectory()) {
      return {
        success: false,
        message: `路径不是目录:${getRelativePath(fullPath)}`,
        path: getRelativePath(fullPath),
      };
    }

    const items = fs.readdirSync(fullPath).map((item) => {
      const itemPath = path.join(fullPath, item);
      const itemStats = fs.statSync(itemPath);
      return {
        name: item,
        type: itemStats.isDirectory()
          ? ('directory' as const)
          : ('file' as const),
        size: itemStats.isFile() ? itemStats.size : undefined,
      };
    });

    return {
      success: true,
      items,
      message: `目录列出成功:${getRelativePath(fullPath)}`,
      path: getRelativePath(fullPath),
    };
  } catch (error) {
    return {
      success: false,
      message: `列出目录出错:${error instanceof Error ? error.message : '未知错误'}`,
      path: dirPath,
    };
  }
}

/**
 * 创建目录
 */
export function createDirectory(dirPath: string): {
  success: boolean;
  message: string;
  path: string;
} {
  try {
    ensureBaseDir();
    const fullPath = validatePath(dirPath);

    if (fs.existsSync(fullPath)) {
      return {
        success: false,
        message: `目录已存在:${getRelativePath(fullPath)}`,
        path: getRelativePath(fullPath),
      };
    }

    fs.mkdirSync(fullPath, { recursive: true });

    return {
      success: true,
      message: `目录创建成功:${getRelativePath(fullPath)}`,
      path: getRelativePath(fullPath),
    };
  } catch (error) {
    return {
      success: false,
      message: `创建目录出错:${error instanceof Error ? error.message : '未知错误'}`,
      path: dirPath,
    };
  }
}

/**
 * 检查文件或目录是否存在
 */
export function exists(pathToCheck: string): {
  success: boolean;
  exists: boolean;
  message: string;
  path: string;
} {
  try {
    ensureBaseDir();
    const fullPath = validatePath(pathToCheck);

    const exists = fs.existsSync(fullPath);

    return {
      success: true,
      exists,
      message: `路径${exists ? '存在' : '不存在'}:${getRelativePath(fullPath)}`,
      path: getRelativePath(fullPath),
    };
  } catch (error) {
    return {
      success: false,
      exists: false,
      message: `检查路径出错:${error instanceof Error ? error.message : '未知错误'}`,
      path: pathToCheck,
    };
  }
}

/**
 * 按模式搜索文件(简单的类 glob 搜索)
 */
export function searchFiles(
  pattern: string,
  searchDir: string = '.',
): {
  success: boolean;
  files?: string[];
  message: string;
  pattern: string;
  searchDir: string;
} {
  try {
    ensureBaseDir();
    const fullSearchDir = validatePath(searchDir);

    if (!fs.existsSync(fullSearchDir)) {
      return {
        success: false,
        message: `搜索目录未找到:${getRelativePath(fullSearchDir)}`,
        pattern,
        searchDir: getRelativePath(fullSearchDir),
      };
    }

    const stats = fs.statSync(fullSearchDir);
    if (!stats.isDirectory()) {
      return {
        success: false,
        message: `搜索路径不是目录:${getRelativePath(fullSearchDir)}`,
        pattern,
        searchDir: getRelativePath(fullSearchDir),
      };
    }

    const foundFiles: string[] = [];

    function searchRecursively(currentDir: string): void {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const itemPath = path.join(currentDir, item);
        const relativeItemPath = getRelativePath(itemPath);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          searchRecursively(itemPath);
        } else if (stats.isFile()) {
          // 简单的模式匹配(支持 * 通配符)
          const regexPattern = pattern.replace(/\*/g, '.*');
          const regex = new RegExp(regexPattern);

          if (regex.test(item) || regex.test(relativeItemPath)) {
            foundFiles.push(relativeItemPath);
          }
        }
      }
    }

    searchRecursively(fullSearchDir);

    return {
      success: true,
      files: foundFiles,
      message: `找到 ${foundFiles.length} 个匹配模式 "${pattern}" 的文件`,
      pattern,
      searchDir: getRelativePath(fullSearchDir),
    };
  } catch (error) {
    return {
      success: false,
      message: `搜索文件出错:${error instanceof Error ? error.message : '未知错误'}`,
      pattern,
      searchDir,
    };
  }
}

// 将所有函数作为单个对象导出,便于工具注册
export const fileSystemTools = {
  writeFile,
  readFile,
  deletePath,
  listDirectory,
  createDirectory,
  exists,
  searchFiles,
};
