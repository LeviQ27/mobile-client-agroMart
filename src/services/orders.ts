import initializeApi from './api';

const getArray = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const normalizeOrder = (item: any) => {
  const attrs = item?.attributes || item || {};
  const loja = attrs.loja?.data?.attributes || attrs.loja || {};
  return {
    id: item?.id || attrs.id,
    ...attrs,
    codigo: attrs.codigo || `Pedido #${item?.id || attrs.id}`,
    status: attrs.status || 'AGUARDANDO_PAGAMENTO',
    valor_total: Number(attrs.valor_total || attrs.valor || 0),
    itens: Array.isArray(attrs.itens) ? attrs.itens : [],
    loja,
    created_at: attrs.created_at || attrs.createdAt,
  };
};

export const ordersService = {
  async listMine() {
    const api = await initializeApi();
    const response = await api.get('pedidos/me', { params: { populate: '*' } });
    return getArray(response.data).map(normalizeOrder);
  },

  async createPedido(data: any) {
    const api = await initializeApi();
    const response = await api.post('pedidos', { data });
    return normalizeOrder(response.data?.data || response.data);
  },
};
