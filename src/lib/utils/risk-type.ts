type RiskType = 'Conservative' | 'Moderate' | 'Agressive' | 'Unknown Risk';

export function getRiskNameByScore(score: number): RiskType {
  if (score >= 0 && score <= 33) return 'Conservative';
  if (score > 34 && score <= 66) return 'Moderate';
  if (score > 67 && score <= 100) return 'Agressive';
  
  return 'Unknown Risk';
}