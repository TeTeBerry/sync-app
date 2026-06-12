export type ExclusiveItineraryStage = 'main' | 'bass' | 'late' | 'outdoor';

export type ExclusiveItineraryDj = {
  id: string;
  name: string;
  genre: string;
  genreLabel: string;
  stage: ExclusiveItineraryStage;
  popularity: number;
  avatarSeed: string;
  genreColor: string;
};
