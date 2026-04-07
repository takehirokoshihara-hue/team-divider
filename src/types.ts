export interface Member {
  id: string;
  name: string;
  department: string;
  isManager?: boolean;
  isTalkative?: boolean;
}

export interface TeamMember extends Member {
  seatNumber: number;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}
