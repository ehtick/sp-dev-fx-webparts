export function buildGroups(names: string[], groupSize: number): string[][] {
  const safeSize = Math.max(2, groupSize);
  const filtered = names.filter(n => n.trim() !== '');

  if (filtered.length <= 1) return [];

  const shuffled = [...filtered];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const n = shuffled.length;
  if (safeSize >= n) return [shuffled];

  const groupCount = Math.floor(n / safeSize);
  const remainder = n % safeSize;

  if (remainder <= groupCount) {
    const groups: string[][] = [];
    let index = 0;
    for (let g = 0; g < groupCount; g++) {
      const size = g < remainder ? safeSize + 1 : safeSize;
      groups.push(shuffled.slice(index, index + size));
      index += size;
    }
    return groups;
  }

  const groups: string[][] = [];
  for (let i = 0; i < n; i += safeSize) {
    groups.push(shuffled.slice(i, i + safeSize));
  }
  return groups;
}
