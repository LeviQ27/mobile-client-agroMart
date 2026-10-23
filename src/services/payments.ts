import initializeApi from './api';

export interface PaymentReceiptFile {
  uri?: string;
  name?: string;
  mimeType?: string;
  type?: string;
  file?: Blob;
}

const firstDefined = (...values: any[]) => values.find(value => value !== undefined && value !== null && value !== '');

export const normalizePayment = (item: any) => {
  const attrs = item?.attributes || item || {};
  const comprovante = firstDefined(attrs.comprovante?.data, attrs.comprovante, item?.comprovante);

  return {
    id: firstDefined(item?.id, attrs.id),
    ...attrs,
    referencia_pedido: firstDefined(
      attrs.referencia_pedido,
      attrs.referenciaPedido,
      attrs.extrato?.data?.attributes?.id,
      attrs.extrato?.id,
      'Pedido não vinculado',
    ),
    valor: Number(firstDefined(attrs.valor, attrs.amount, 0)),
    status: String(firstDefined(attrs.status, 'PENDENTE')).toUpperCase(),
    txid: firstDefined(attrs.txid, attrs.pix_txid, attrs.pixTxid),
    pix_copia_cola: firstDefined(attrs.pix_copia_cola, attrs.pix_payload, attrs.pixPayload, attrs.payload_pix),
    qr_code_url: firstDefined(attrs.qr_code_url, attrs.qrCodeUrl, attrs.qrcode, attrs.qr_code),
    chave_pix: firstDefined(attrs.chave_pix, attrs.pix_chave, attrs.pixKey),
    nome_recebedor: firstDefined(attrs.nome_recebedor, attrs.recebedor, attrs.nomeRecebedor),
    comprovante,
  };
};

const getResponseData = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

export const paymentService = {
  async list() {
    const api = await initializeApi();
    const response = await api.get('/pagamentos/me', {
      params: { populate: ['comprovante', 'extrato', 'loja', 'consumidor'] },
    });
    const data = getResponseData(response.data);
    return data.map(normalizePayment);
  },

  async sendReceipt(id: string | number, receiptFile: PaymentReceiptFile, observacao?: string) {
    const api = await initializeApi();
    const formData = new FormData();

    if ((receiptFile as any).file) {
      formData.append('comprovante', (receiptFile as any).file, receiptFile.name || 'comprovante');
    } else {
      formData.append('comprovante', {
        uri: receiptFile.uri,
        name: receiptFile.name || 'comprovante.jpg',
        type: receiptFile.mimeType || receiptFile.type || 'application/octet-stream',
      } as any);
    }

    if (observacao) {
      formData.append('data', JSON.stringify({ observacao }));
    }

    const response = await api.post(`/pagamentos/${id}/comprovante`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return normalizePayment(response.data?.data || response.data);
  },
};
