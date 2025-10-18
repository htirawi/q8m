const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all Vue files
const findVueFiles = (dir) => {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
      files.push(...findVueFiles(fullPath));
    } else if (item.endsWith('.vue')) {
      files.push(fullPath);
    }
  }
  
  return files;
};

// Check Vue files using vue-tsc
const checkVueFile = (file) => {
  try {
    const result = execSync(`npx vue-tsc --noEmit "${file}" 2>&1`, { 
      encoding: 'utf8',
      cwd: path.join(__dirname, '../client')
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, output: error.stdout || error.message };
  }
};

// Main execution
const clientDir = path.join(__dirname, '../client/src');
const vueFiles = findVueFiles(clientDir);

console.log(`Found ${vueFiles.length} Vue files to check...`);

let failed = 0;
const errors = [];

for (const file of vueFiles) {
  const relativePath = path.relative(clientDir, file);
  console.log(`Checking ${relativePath}...`);
  
  const result = checkVueFile(file);
  
  if (!result.success) {
    failed++;
    errors.push({
      file: relativePath,
      error: result.output
    });
    
    // Show first few errors for this file
    const lines = result.output.split('\n').slice(0, 5);
    console.error(`✖ Errors in ${relativePath}:`);
    lines.forEach(line => {
      if (line.trim()) console.error(`  ${line}`);
    });
  }
}

console.log(`\n${failed} files failed out of ${vueFiles.length} total files.`);

if (failed > 0) {
  console.log('\nFiles with errors:');
  errors.forEach(({ file, error }) => {
    console.log(`- ${file}`);
  });
  
  process.exit(1);
} else {
  console.log('✅ All Vue files compiled successfully!');
}
