const path = require("path");
const fs = require("fs/promises");

const source = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "ipcore_lib",
  "generator",
  "hdl",
  "templates",
);
const target = path.resolve(__dirname, "..", "src", "generator", "templates");

async function copyTemplates() {
  await fs.rm(target, { recursive: true, force: true });
  await fs.mkdir(target, { recursive: true });
  await fs.cp(source, target, { recursive: true });
  console.log(`Copied templates from ${source} to ${target}`);
}

copyTemplates().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
