import { produtosService } from "../produtos/produtos.service";

export const produtoExtrasService = {
  list() {
    return produtosService.listAllVinculos();
  },

  create(produtoId: number, extraProdutoId: number) {
    return produtosService.addExtra(produtoId, extraProdutoId);
  },

  remove(produtoId: number, extraProdutoId: number) {
    return produtosService.removeExtra(produtoId, extraProdutoId);
  },
};
