const { readdirSync } = require('fs');
const { join } = require('path');
const { spawn } = require('child_process');

const rootDir = join(__dirname, '..');
const testsDir = join(rootDir, 'tests');

const estimatedDurationsMs = {
  'auth.integration.test.js': 25000,
  'ml.integration.test.js': 500,
  'operations.integration.test.js': 60000,
  'optimization.integration.test.js': 18000,
  'phase7.services.test.js': 1000,
  'phase8.jobs.test.js': 1000,
  'return-load.integration.test.js': 105000,
  'tracking.integration.test.js': 75000,
};

const testFiles = readdirSync(testsDir)
  .filter((file) => file.endsWith('.test.js'))
  .sort((left, right) => (estimatedDurationsMs[right] || 5000) - (estimatedDurationsMs[left] || 5000))
  .map((file) => join('tests', file));

const workerCount = Math.max(
  1,
  Math.min(Number.parseInt(process.env.TEST_WORKERS || '2', 10) || 2, testFiles.length)
);

const runTestFile = (file) =>
  new Promise((resolve) => {
    const child = spawn(process.execPath, ['--test', file], {
      cwd: rootDir,
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
      stdio: 'inherit',
    });

    child.on('close', (code) => {
      resolve(code ?? 1);
    });
  });

(async () => {
  let failureCount = 0;
  let nextIndex = 0;

  const runWorker = async () => {
    while (nextIndex < testFiles.length) {
      const file = testFiles[nextIndex];
      nextIndex += 1;

      const exitCode = await runTestFile(file);
      if (exitCode !== 0) {
        failureCount += 1;
      }
    }
  };

  await Promise.all(Array.from({ length: workerCount }, () => runWorker()));

  if (failureCount > 0) {
    process.exitCode = 1;
  }
})();
