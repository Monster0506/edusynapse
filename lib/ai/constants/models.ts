export const models: { [key: string]: string } = {
  think: "deepseek-r1:7b",
  natural: "qwen/qwen2.5-32b",
  fast: "Qwen/Qwen2.5-3B",
  image: "llama3.2-vision",
};

export const userModels = {
  fast: models.fast,
  natural: models.natural,
};
