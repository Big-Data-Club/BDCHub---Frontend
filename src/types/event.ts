export interface TimelinePhase {
  time: string;
  title: string;
  description: string;
}

export interface TimelineDay {
  id: string;
  title: string;
  date: Date;
  events: TimelinePhase[];
}

export interface EventConfig {
  id: string;
  title: string;
  subtitle: string;
  registrationStart: Date;
  registrationEnd: Date;
  location: string;
  totalPrizePool: string;
  registrationLink: string;
  objectives: string[];
  structure: {
    phase: string;
    time: string;
    description: string;
  }[];
  prizes: {
    title: string;
    amount: string;
    icon: string;
  }[];
  timelines: TimelineDay[];
}