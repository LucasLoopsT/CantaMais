export type ApiProdutoExtraRow = {
  id: number;
  extraProdutoId: number;
  extraProduto: {
    id: number;
    nome: string;
    preco: number;
    categoria: string[];
    disponivel: boolean;
  };
};

export type ApiProduto = {
  id: number;
  nome: string;
  preco: number;
  disponivel: boolean;
  categoria: string[];
  descricao: string | null;
  imagem: string | null;
  extrasPermitidos?: ApiProdutoExtraRow[];
};
