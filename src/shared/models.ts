export interface Election {
  id: string;
  type: string;
  name: string;
  caption: string;
  image: string;
  color: string;
  polls?: Poll[];
}

export interface Poll {
  id: string;
  type: string;
  name: string;
  image?: string;
  caption: string;
  color: string;
  parentID: string;
  candidates?: Candidate[];
}

export interface Candidate {
  id: string;
  type: string;
  name: string;
  image: string;
  votes: number;
  parentID: string;
  fallback: string;
  fallbackName?: string;
}

export interface Image {
  id: string;
  type: string;
  resourceID: string;
}
