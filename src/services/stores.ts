import initializeApi, { normalizeApiBaseUrl } from './api';

const API_ROOT = normalizeApiBaseUrl(process.env.EXPO_PUBLIC_API_URL).replace(/\/api\/$/, '');

const firstDefined = (...values: any[]) => values.find(value => value !== undefined && value !== null && value !== '');

const mediaUrl = (media: any): string => {
  const raw = firstDefined(media?.url, media?.data?.attributes?.url, media?.attributes?.url);
  if (!raw) return '';
  return String(raw).startsWith('http') ? raw : `${API_ROOT}${raw}`;
};

const normalizeMediaListItem = (item: any) => ({
  ...item,
  id: firstDefined(item?.id, item?.attributes?.id),
  url: mediaUrl(item?.imagem || item?.imagem?.data || item?.image),
  imagem: item?.imagem,
});

export const normalizeStore = (item: any) => {
  const attrs = item?.attributes || item || {};
  const endereco = attrs.endereco?.data?.attributes || attrs.endereco || {};
  const banner = attrs.banner?.data?.attributes || attrs.banner || null;
  const produtos = firstDefined(attrs.produto_avulsos?.data, attrs.produto_avulsos, attrs.produtos_avulsos, []);
  const cestas = firstDefined(attrs.cestas?.data, attrs.cestas, []);
  const planos = firstDefined(attrs.planos?.data, attrs.planos, []);

  return {
    id: Number(firstDefined(item?.id, attrs.id)),
    ...attrs,
    nome: firstDefined(attrs.nome, 'Loja sem nome'),
    descricao: firstDefined(attrs.descricao, ''),
    contato: String(firstDefined(attrs.contato, '')),
    endereco,
    banner: banner ? { ...banner, url: mediaUrl(banner) } : null,
    produto_avulsos: Array.isArray(produtos) ? produtos.map((entry: any) => normalizeMediaListItem(entry.attributes ? { id: entry.id, ...entry.attributes } : entry)) : [],
    cestas: Array.isArray(cestas) ? cestas.map((entry: any) => normalizeMediaListItem(entry.attributes ? { id: entry.id, ...entry.attributes } : entry)) : [],
    planos: Array.isArray(planos) ? planos.map((entry: any) => normalizeMediaListItem(entry.attributes ? { id: entry.id, ...entry.attributes } : entry)) : [],
  };
};

const getArray = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const storesService = {
  async list() {
    const api = await initializeApi();
    const response = await api.get('lojas', { params: { populate: '*' } });
    return getArray(response.data).map(normalizeStore);
  },
};
