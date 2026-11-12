export interface ExamQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  topic: string;
  difficulty: 'Easy' | 'Normal' | 'Hard';
}

export interface ExamDef {
  id: string;
  title: string;
  shortDesc: string;
  category: string;
  bossName: string;
  bossTitle: string;
  bossHp: number;
  timeLimitSecPerQuestion: number;
  passPercentage: number; // 70
  questions: ExamQuestion[];
  rewardCosmeticId?: string;
  rewardPerfectCosmeticId?: string;
}
