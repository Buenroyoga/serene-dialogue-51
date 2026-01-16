import { ACTExercise } from '@/lib/actExercises';

export interface PremiumSummary {
  findings: string[];
  underlyingValue: string;
  ifThenPlan: { trigger: string; response: string }[];
  exercises: ACTExercise[];
  commitment: string;
  fullDocument: string;
}

export interface TransformationResult {
  emoji: string;
  title: string;
  message: string;
}
