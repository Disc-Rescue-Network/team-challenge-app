export interface Player {
  name: string;
  pdgaNumber: number;
  rating: number;
  class: string;
  city: string;
  state: string;
  country: string;
  membershipStatus: string;
  active: boolean;
  isEditing: boolean;
  gender: "male" | "female";
  tempRating: number;
}
