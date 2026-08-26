import http from "http";
import https from "https";

export interface LocalLLMConfig {
  endpoint: string; // e.g. http://localhost:11434
  modelName: string; // e.g. moodaware-llm or llama3.2
  temperature?: number;
  maxTokens?: number;
}

const DEFAULT_CONFIG: LocalLLMConfig = {
  endpoint: process.env.OLLAMA_ENDPOINT || "http://localhost:11434",
  modelName: process.env.OLLAMA_MODEL || "moodaware-llm",
  temperature: 0.7,
  maxTokens: 1024,
};

export async function checkLocalLLMAvailability(endpoint = DEFAULT_CONFIG.endpoint): Promise<{ isAvailable: boolean; models: string[] }> {
  try {
    const url = new URL("/api/tags", endpoint);
    const isHttps = url.protocol === "https:";
    const client = isHttps ? https : http;

    return new Promise((resolve) => {
      const req = client.get(url, { timeout: 2000 }, (res) => {
        if (res.statusCode !== 200) {
          return resolve({ isAvailable: false, models: [] });
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            const models = Array.isArray(json.models) ? json.models.map((m: any) => m.name) : [];
            resolve({ isAvailable: true, models });
          } catch {
            resolve({ isAvailable: false, models: [] });
          }
        });
      });

      req.on("error", () => resolve({ isAvailable: false, models: [] }));
      req.on("timeout", () => {
        req.destroy();
        resolve({ isAvailable: false, models: [] });
      });
    });
  } catch (error) {
    return { isAvailable: false, models: [] };
  }
}

export async function generateWithLocalLLM(
  prompt: string,
  systemPrompt = "You are Agust, the empathetic AI Personal Manager for MoodAware.",
  customConfig?: Partial<LocalLLMConfig>
): Promise<string> {
  const config = { ...DEFAULT_CONFIG, ...customConfig };
  const url = new URL("/api/generate", config.endpoint);
  const isHttps = url.protocol === "https:";
  const client = isHttps ? https : http;

  const payload = JSON.stringify({
    model: config.modelName,
    prompt: prompt,
    system: systemPrompt,
    stream: false,
    options: {
      temperature: config.temperature,
      num_predict: config.maxTokens,
    },
  });

  return new Promise((resolve, reject) => {
    const req = client.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
        timeout: 10000,
      },
      (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Local LLM responded with status ${res.statusCode}`));
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            if (json.response) {
              resolve(json.response.trim());
            } else {
              reject(new Error("No response field in Local LLM output"));
            }
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on("error", (err) => reject(err));
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Local LLM request timed out"));
    });

    req.write(payload);
    req.end();
  });
}
