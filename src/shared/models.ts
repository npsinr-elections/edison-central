export interface Election {
  _id?: string;
  id: string;
  type: string;
  name: string;
  caption: string;
  image: string;
  color: string;
  polls?: Poll[];
}

export interface Poll {
  _id?: string;
  id: string;
  type: string;
  name: string;
  image?: string;
  caption: string;
  color: string;
  parentID: string;
  candidates?: Candidate[];
  winners?: Candidate[];
}

export interface Candidate {
  _id?: string;
  id: string;
  type: string;
  name: string;
  image: string;
  votes: number;
  parentID: string;
  fallback: string;
  fallbackName?: string;
  isWinner?: boolean;
}

export interface Image {
  _id?: string;
  id: string;
  type: string;
  resourceID: string;
}
