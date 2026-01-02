import fs from 'fs/promises';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'config.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dir = path.dirname(CONFIG_PATH);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function getConfig() {
  // Priority: Environment Variables > config.json
  const envConfig = {
    proxmoxUrl: process.env.PROXMOX_URL,
    proxmoxUser: process.env.PROXMOX_USER,
    proxmoxTokenId: process.env.PROXMOX_TOKEN_ID,
    proxmoxTokenSecret: process.env.PROXMOX_TOKEN_SECRET,
    tailscaleApiKey: process.env.TAILSCALE_API_KEY,
    tailscaleTailnet: process.env.TAILSCALE_TAILNET,
  };

  try {
    await ensureDataDir();
    const data = await fs.readFile(CONFIG_PATH, 'utf-8');
    const jsonConfig = JSON.parse(data);
    // Merge strategy: Use Env if present, else JSON.
    const merged = {};
    for (const key in envConfig) {
      merged[key] = envConfig[key] || jsonConfig[key];
    }
    return merged;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return envConfig;
    }
    console.error("Error reading config:", error);
    return envConfig;
  }
}

export async function saveConfig(newConfig) {
  await ensureDataDir();
  // We only save to JSON, never ENV.
  // First read existing to merge?
  let existing = {};
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf-8');
    existing = JSON.parse(data);
  } catch { }

  const final = { ...existing, ...newConfig };
  await fs.writeFile(CONFIG_PATH, JSON.stringify(final, null, 2), 'utf-8');
  return final;
}
