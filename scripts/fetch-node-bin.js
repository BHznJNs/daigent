import { createWriteStream, promises as fs } from 'node:fs';
import { createGunzip } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';
import tar from 'tar';
import AdmZip from 'adm-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 根据平台和架构获取下载 URL
 * @param {string} version - Node.js 版本，如 'v25.0.0'
 * @param {string} platform - 操作系统：'win32', 'darwin', 'linux', 'aix'
 * @param {string} arch - 架构：'x64', 'arm64', 'ppc64', 'ppc64le', 's390x'
 * @returns {Object} - { url, filename, executableName }
 */
function getDownloadInfo(version, platform, arch) {
  const baseUrl = `https://nodejs.org/dist/${version}/`;
  
  let filename;
  let executableName = 'node';
  
  if (platform === 'win32') {
    executableName = 'node.exe';
    filename = `node-${version}-win-${arch}.zip`;
  } else if (platform === 'darwin') {
    filename = `node-${version}-darwin-${arch}.tar.gz`;
  } else if (platform === 'linux') {
    filename = `node-${version}-linux-${arch}.tar.gz`;
  } else if (platform === 'aix') {
    filename = `node-${version}-aix-${arch}.tar.gz`;
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  
  return {
    url: baseUrl + filename,
    filename,
    executableName
  };
}

/**
 * 下载文件
 * @param {string} url - 下载地址
 * @param {string} destination - 保存路径
 */
async function downloadFile(url, destination) {
  console.log(`Downloading from: ${url}`);
  
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // 处理重定向
      if (response.statusCode === 302 || response.statusCode === 301) {
        downloadFile(response.headers.location, destination)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      const fileStream = createWriteStream(destination);
      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;
      
      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        const progress = ((downloadedSize / totalSize) * 100).toFixed(2);
        process.stdout.write(`\rDownload progress: ${progress}%`);
      });
      
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        console.log('\nDownload completed!');
        resolve();
      });
      
      fileStream.on('error', (err) => {
        fs.unlink(destination);
        reject(err);
      });
    }).on('error', reject);
  });
}

/**
 * 解压 tar.gz 文件并提取 node 可执行文件
 * @param {string} archivePath - 压缩包路径
 * @param {string} outputDir - 输出目录
 * @param {string} executableName - 可执行文件名
 */
async function extractTarGz(archivePath, outputDir, executableName) {
  console.log('Extracting tar.gz archive...');

  await tar.x({
    cwd: outputDir,
    file: archivePath,
    filter: (path) => {
      // 只提取 bin/node 文件
      return path.endsWith(`bin/${executableName}`)
    },
    strip: 2,
    onentry: (entry) => console.log(`Extracting: ${entry.path}`)
  });
  return join(outputDir, executableName);
}

/**
 * 解压 zip 文件并提取 node.exe
 * @param {string} archivePath - 压缩包路径
 * @param {string} outputDir - 输出目录
 * @param {string} executableName - 可执行文件名
 */
async function extractZip(archivePath, outputDir, executableName) {
  console.log('Extracting zip archive...');
  
  const zip = new AdmZip(archivePath);
  const zipEntries = zip.getEntries();
  
  for (const entry of zipEntries) {
    if (entry.entryName.endsWith(executableName)) {
      console.log(`Extracting: ${entry.entryName}`);
      
      // 直接提取到目标位置
      const targetPath = join(outputDir, executableName);
      const content = entry.getData();
      await fs.writeFile(targetPath, content);
      
      console.log(`Extracted to: ${targetPath}`);
      return targetPath;
    }
  }
  
  throw new Error('Node executable not found in archive');
}

/**
 * 主函数
 * @param {Object} options - 配置选项
 * @param {string} options.version - Node.js 版本
 * @param {string} options.platform - 操作系统
 * @param {string} options.arch - 架构
 * @param {string} options.outputDir - 输出目录
 */
async function downloadAndExtractNode(options) {
  const {
    version = 'v25.0.0',
    platform = process.platform,
    arch = process.arch,
    outputDir = join(__dirname, 'node-binaries')
  } = options;
  
  try {
    // 创建输出目录
    await fs.mkdir(outputDir, { recursive: true });
    
    // 获取下载信息
    const { url, filename, executableName } = getDownloadInfo(version, platform, arch);
    const archivePath = join(outputDir, filename);
    
    // 下载文件
    await downloadFile(url, archivePath);
    
    // 解压文件
    let finalPath;
    if (filename.endsWith('.zip')) {
      finalPath = await extractZip(archivePath, outputDir, executableName);
    } else if (filename.endsWith('.tar.gz')) {
      finalPath = await extractTarGz(archivePath, outputDir, executableName);
    }
    
    // 删除压缩包
    await fs.unlink(archivePath);
    console.log('Archive deleted.');
    
    // 设置执行权限 (Unix-like 系统)
    if (platform !== 'win32' && finalPath) {
      await fs.chmod(finalPath, 0o755);
    }
    
    console.log(`\n✓ Node executable extracted to: ${finalPath}`);
    return finalPath;
    
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

try {
  await downloadAndExtractNode({
    version: 'v25.0.0',
    // platform: 'darwin',  // 可选：'win32', 'darwin', 'linux', 'aix'
    // arch: 'x64',        // 可选：'x64', 'arm64', 'ppc64', 'ppc64le', 's390x'
    outputDir: join(__dirname, '../node-bin')
  }).catch(console.error);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
