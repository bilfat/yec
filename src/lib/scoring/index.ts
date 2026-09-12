/**
 * YEC Server Scoring Engine
 * Contains all business logic for calculating judge criteria scores,
 * weighted contributions, and multi-judge final score aggregations.
 */

export interface PointScore {
  criterion_point_id: string
  score: number
}

export interface CriterionWithScores {
  id: string
  name: string
  weight: number
  points: { id: string; name: string }[]
}

/**
 * Calculates the average score for a single criterion from its point scores.
 */
export function calculateCriteriaScore(pointScores: number[]): number {
  if (!pointScores || pointScores.length === 0) return 0
  const sum = pointScores.reduce((acc, curr) => acc + curr, 0)
  return sum / pointScores.length
}

/**
 * Calculates the weighted contribution of a criterion score based on its percentage weight.
 */
export function calculateWeightedContribution(criteriaScore: number, weight: number): number {
  return (criteriaScore * weight) / 100
}

/**
 * Calculates the total score out of 100 for a single judge evaluation.
 */
export function calculateJudgeTotalScore({
  criteriaList,
  scoresMap,
}: {
  criteriaList: CriterionWithScores[]
  scoresMap: Record<string, number>
}): {
  totalScore: number
  criteriaBreakdown: { name: string; weight: number; score: number }[]
} {
  let totalScore = 0
  const criteriaBreakdown: { name: string; weight: number; score: number }[] = []

  for (const criterion of criteriaList) {
    const pointIds = criterion.points.map((p) => p.id)
    const validScores = pointIds
      .map((id) => scoresMap[id])
      .filter((s) => s !== undefined && s !== null && !isNaN(Number(s)))
      .map(Number)

    const criteriaAvg = calculateCriteriaScore(validScores)
    const contribution = calculateWeightedContribution(criteriaAvg, criterion.weight)

    totalScore += contribution
    criteriaBreakdown.push({
      name: criterion.name,
      weight: criterion.weight,
      score: Math.round(criteriaAvg * 10) / 10,
    })
  }

  return {
    totalScore: Math.round(totalScore * 100) / 100,
    criteriaBreakdown,
  }
}

/**
 * Aggregates multiple judge total scores into a final team score.
 */
export function calculateFinalAggregatedScore(judgeScores: number[]): number | null {
  if (!judgeScores || judgeScores.length === 0) return null
  const sum = judgeScores.reduce((acc, curr) => acc + curr, 0)
  return Math.round((sum / judgeScores.length) * 100) / 100
}

/**
 * Standardizes raw database template criteria into structured CriterionWithScores array.
 */
export function formatTemplateCriteria(rawCriteria: unknown[]): CriterionWithScores[] {
  if (!Array.isArray(rawCriteria)) return []

  return (rawCriteria as any[])
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((c) => ({
      id: c.id,
      name: c.name,
      weight: Number(c.weight || 0),
      points: (c.criterion_points || [])
        .sort((pa: any, pb: any) => (pa.sort_order ?? 0) - (pb.sort_order ?? 0))
        .map((p: any) => ({
          id: p.id,
          name: p.name
        }))
    }))
}
