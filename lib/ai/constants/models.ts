export const models: { [key: string]: string } = {
  think: "gemini-2.0-flash-thinking-exp-01-21",
  natural: "gemini-2.0-flash",
  fast: "gemini-2.0-flash",
  image: "llama3.2-vision",
};

export const userModels = {
  fast: models.fast,
  natural: models.natural,
};
