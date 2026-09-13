export const formatSessionSeconds = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

export const capSessionSeconds = (seconds: number, goalSeconds?: number) => {
  const safeSeconds = Math.max(0, seconds);

  return goalSeconds ? Math.min(safeSeconds, goalSeconds) : safeSeconds;
};

