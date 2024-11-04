export interface Chunk {
    content: string;
    pageNumber: number;
  }
  
  export interface ResourceWithEmbedding {
    content: string;
    embedding: number[];
  }