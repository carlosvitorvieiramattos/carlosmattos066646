
export interface TutorFoto {
  id: number;
  nome: string;        
  url: string;         
  contentType: string; 
}


export interface Tutor {
  id?: number;         
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  
  
  cpf: string; 

  
  foto?: TutorFoto;
  fotoUrl?: string;
  
  pets?: any[]; 
}