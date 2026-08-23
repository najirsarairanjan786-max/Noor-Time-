const { execSync } = require('child_process');
try {
  const out = execSync('node -e "require(\'./dist/server.cjs\')" & sleep 2 && kill $!', { shell: true, stdio: 'pipe' });
  console.log(out.toString());
} catch (e) {
  console.log("Error:", e.stderr ? e.stderr.toString() : e.message);
}
