export interface GloPrizeEntry {
  amount?: string;
  number: string[];
}

export interface GloPrizes {
  first?: GloPrizeEntry;
  nearby?: GloPrizeEntry;
  secondPrize?: GloPrizeEntry;
  threeDigitPrefix?: GloPrizeEntry;
  threeDigitSuffix?: GloPrizeEntry;
  twoDigit?: GloPrizeEntry;
}

export interface GloLotteryResult {
  date: string;
  prizes: GloPrizes;
}

export interface DigitCount {
  digit: string;
  count: number;
}

export interface LottoStats {
  twoDigit: DigitCount[];
  threeDigitSuffix: DigitCount[];
  periodsAnalyzed: number;
  dateRange: { from: string; to: string };
}
