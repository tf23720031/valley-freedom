export type BookingDuration = 'half-day' | 'full-day'

export interface RevenueAssumptions {
  halfDayPrice: number
  fullDayPrice: number
  youthBaseHourlyRate: number
  employerBurdenRate: number
  preparationAndTravelHours: number
  operatorValuePerPerson: number
  platformRate: number
  processingRate: number
  insurancePerPerson: number
  monthlyFixedCost: number
}

export const DEFAULT_REVENUE_ASSUMPTIONS: RevenueAssumptions = {
  halfDayPrice: 1000,
  fullDayPrice: 1800,
  youthBaseHourlyRate: 210,
  employerBurdenRate: 1 / 6,
  preparationAndTravelHours: 1,
  operatorValuePerPerson: 430,
  platformRate: 0.2,
  processingRate: 0.028,
  insurancePerPerson: 50,
  monthlyFixedCost: 9500,
}

export interface RevenueSnapshot {
  duration: BookingDuration
  serviceHours: number
  partySize: number
  perPersonPrice: number
  gross: number
  platformRate: number
  platformShare: number
  supplyPool: number
  youthStandaloneValue: number
  youthLoadedHourlyRate: number
  operatorStandaloneValue: number
  youthShare: number
  operatorShare: number
  youthPercent: number
  operatorPercent: number
  platformPercent: number
  processingFee: number
  insuranceCost: number
  monthlyFixedCost: number
}

export type RevenueCalculation = { ok: true; value: RevenueSnapshot } | { ok: false; error: string }

function roundTiesToEven(value: number): number {
  const floor = Math.floor(value)
  const fraction = value - floor
  if (fraction < 0.5) return floor
  if (fraction > 0.5) return floor + 1
  return floor % 2 === 0 ? floor : floor + 1
}

export function calculateBookingRevenue(input: {
  duration: BookingDuration
  partySize: number
  assumptions?: RevenueAssumptions
}): RevenueCalculation {
  const assumptions = input.assumptions ?? DEFAULT_REVENUE_ASSUMPTIONS
  const values = Object.values(assumptions)
  if (!Number.isInteger(input.partySize) || input.partySize < 1 || input.partySize > 20) return { ok: false, error: '同行人數須為 1 至 20 人。' }
  if (values.some((value) => !Number.isFinite(value) || value < 0) || assumptions.platformRate > 1 || assumptions.processingRate > 1) return { ok: false, error: '分潤與營運成本參數須為有效的非負數值。' }

  const serviceHours = input.duration === 'half-day' ? 4 : 8
  const perPersonPrice = input.duration === 'half-day' ? assumptions.halfDayPrice : assumptions.fullDayPrice
  const gross = perPersonPrice * input.partySize
  const platformShare = Math.round(gross * assumptions.platformRate)
  const supplyPool = gross - platformShare
  const youthLoadedHourlyRate = assumptions.youthBaseHourlyRate * (1 + assumptions.employerBurdenRate)
  const youthStandaloneValue = (serviceHours + assumptions.preparationAndTravelHours) * youthLoadedHourlyRate
  const operatorStandaloneValue = assumptions.operatorValuePerPerson * input.partySize
  const idealYouthShare = (youthStandaloneValue + supplyPool - operatorStandaloneValue) / 2
  const idealOperatorShare = supplyPool - idealYouthShare
  if (idealYouthShare < 0 || idealOperatorShare < 0) return { ok: false, error: '目前個別價值高於可分配供給池，請調整青年或業者價值參數。' }

  const youthShare = Math.min(supplyPool, Math.max(0, roundTiesToEven(idealYouthShare)))
  const operatorShare = supplyPool - youthShare
  const percent = (amount: number) => Math.round((amount / gross) * 100)
  return {
    ok: true,
    value: {
      duration: input.duration, serviceHours, partySize: input.partySize, perPersonPrice, gross,
      platformRate: assumptions.platformRate, platformShare, supplyPool,
      youthStandaloneValue, operatorStandaloneValue,
      youthLoadedHourlyRate,
      youthShare, operatorShare,
      youthPercent: percent(youthShare), operatorPercent: percent(operatorShare), platformPercent: percent(platformShare),
      processingFee: Math.round(gross * assumptions.processingRate),
      insuranceCost: assumptions.insurancePerPerson * input.partySize,
      monthlyFixedCost: assumptions.monthlyFixedCost,
    },
  }
}

export interface MonthlyPlatformSummary {
  gross: number
  platformRevenue: number
  processingFees: number
  insuranceCosts: number
  fixedCost: number
  net: number
}

export function calculateMonthlyPlatformNet(orders: RevenueSnapshot[], assumptions: RevenueAssumptions = DEFAULT_REVENUE_ASSUMPTIONS): MonthlyPlatformSummary {
  const gross = orders.reduce((sum, order) => sum + order.gross, 0)
  const platformRevenue = orders.reduce((sum, order) => sum + order.platformShare, 0)
  const processingFees = orders.reduce((sum, order) => sum + order.processingFee, 0)
  const insuranceCosts = orders.reduce((sum, order) => sum + order.insuranceCost, 0)
  const fixedCost = assumptions.monthlyFixedCost
  return { gross, platformRevenue, processingFees, insuranceCosts, fixedCost, net: platformRevenue - processingFees - insuranceCosts - fixedCost }
}
