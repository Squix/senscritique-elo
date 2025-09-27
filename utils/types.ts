export type SensCritiqueRating = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type SensCritiqueUniverse = "movie"

export enum SensCritiqueUniverseEnum {
  "movie"
}

export type Work = {
  initial_rating: SensCritiqueRating;
  title: string;
  elo_score?: number;
  matches_played?: number;
  final_rating?: SensCritiqueRating;
};

export type Match = {
  work_A: Work;
  work_B: Work;
  winner?: "A" | "B";
};