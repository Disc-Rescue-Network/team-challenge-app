type CacheEntry = {
  data: any;
  timestamp: number;
};

const cache: Record<string, CacheEntry> = {};

const getStartOfSecondTuesday = (): number => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay <= 2 ? 2 - firstDay : 9 - firstDay;
  const secondTuesday = new Date(year, month, 1 + offset);
  return secondTuesday.setHours(0, 0, 0, 0);
};

const shouldResetCache = (): boolean => {
  const now = new Date().getTime();
  const startOfSecondTuesday = getStartOfSecondTuesday();
  return (
    now >= startOfSecondTuesday &&
    now < startOfSecondTuesday + 24 * 60 * 60 * 1000
  );
};

const checkCache = (key: string): any => {
  if (shouldResetCache()) {
    Object.keys(cache).forEach((key) => delete cache[key]);
  }

  const entry = cache[key];
  if (entry && Date.now() - entry.timestamp < 30 * 24 * 60 * 60 * 1000) {
    return entry.data;
  }

  return null;
};

const setCache = (key: string, data: any): void => {
  cache[key] = {
    data,
    timestamp: Date.now(),
  };
};

export { checkCache, setCache };
