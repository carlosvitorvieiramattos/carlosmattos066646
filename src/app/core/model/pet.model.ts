
export interface PetFoto {
  id: number;
  nome: string;        
  url: string;         
  contentType: string; 
}


export interface Pet {
  id?: number;          
  nome: string;
  raca: string;
  idade: number;
  

  tutores?: Array<{
    id: number;
    nome: string;
    cpf: string;
  }>;

  foto?: PetFoto; 

  observacoes?: string;
  
  dataCadastro?: string; 
}