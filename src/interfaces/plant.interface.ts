export interface Plant {
  id: string;
  plantName: string;
  acronym: string
  facility: {
    [key: string]: any;
  };
}
