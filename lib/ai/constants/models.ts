export const models: { [key: string]: string } = {
  think: "deepseek-r1:7b",
  natural: "steve-medium",
  fast: "steve-small",
  image: "llama3.2-vision",
};

export const userModels = {
  fast: models.fast,
  natural: models.natural,
};
