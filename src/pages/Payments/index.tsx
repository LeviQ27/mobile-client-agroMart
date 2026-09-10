import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import QRCode from 'qrcode';

import { paymentService, PaymentReceiptFile } from '../../services/payments';

interface Payment {
  id: string | number;
  referencia_pedido: string;
  valor: number;
  status: string;
  txid?: string;
  pix_copia_cola?: string;
  qr_code_url?: string;
  chave_pix?: string;
  nome_recebedor?: string;
  comprovante?: any;
}

const statusLabels: Record<string, string> = {
  PENDENTE: 'Pendente',
  COMPROVANTE_ENVIADO: 'Com comprovante',
  EM_ANALISE: 'Em análise',
  DIVERGENTE: 'Divergente',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
  EXPIRADO: 'Expirado',
};

const finalStatuses = ['APROVADO', 'REJEITADO', 'EXPIRADO'];

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  const summary = useMemo(() => ({
    pending: payments.filter(item => item.status === 'PENDENTE').length,
    receipts: payments.filter(item => item.status === 'COMPROVANTE_ENVIADO' || item.status === 'EM_ANALISE').length,
    approved: payments.filter(item => item.status === 'APROVADO').length,
  }), [payments]);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await paymentService.list();
      setPayments(data);
    } catch (error) {
      Alert.alert('Erro ao carregar pagamentos', 'Não foi possível carregar as cobranças da API. Verifique o login, a URL da API e se o Strapi está rodando.');
    } finally {
      setLoading(false);
    }
  }, []);

  const buildQrCode = useCallback(async (payment: Payment) => {
    if (payment.qr_code_url) return payment.qr_code_url;
    if (!payment.pix_copia_cola) return '';

    try {
      return await QRCode.toDataURL(payment.pix_copia_cola, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 240,
      });
    } catch (error) {
      return '';
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function generateQrs() {
      const entries = await Promise.all(
        payments.map(async payment => [String(payment.id), await buildQrCode(payment)] as const),
      );

      if (mounted) {
        setQrCodes(Object.fromEntries(entries.filter(([, value]) => Boolean(value))));
      }
    }

    generateQrs();

    return () => {
      mounted = false;
    };
  }, [buildQrCode, payments]);

  const pickReceiptFile = useCallback(async (): Promise<PaymentReceiptFile | null> => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets?.[0];
    if (!asset) {
      return null;
    }

    return {
      uri: asset.uri,
      name: asset.name || 'comprovante',
      mimeType: asset.mimeType || 'application/octet-stream',
      file: (asset as any).file,
    };
  }, []);

  const sendReceipt = useCallback(async (payment: Payment) => {
    if (finalStatuses.includes(payment.status)) {
      Alert.alert('Pagamento finalizado', 'Não é possível enviar comprovante para um pagamento já finalizado.');
      return;
    }

    try {
      const receiptFile = await pickReceiptFile();

      if (!receiptFile) {
        return;
      }

      setLoading(true);
      const updated = await paymentService.sendReceipt(
        payment.id,
        receiptFile,
        `Comprovante enviado pelo cliente em ${new Date().toISOString()}`,
      );

      setPayments(current => current.map(item => item.id === payment.id ? { ...item, ...updated } : item));
      Alert.alert('Comprovante enviado', 'O arquivo foi salvo na API e ficou disponível para validação do agricultor.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar o comprovante. Verifique se o arquivo é imagem/PDF e se a API está aceitando upload.');
    } finally {
      setLoading(false);
    }
  }, [pickReceiptFile]);

  const copyPix = useCallback((code?: string) => {
    if (!code) {
      Alert.alert('Pix indisponível', 'Esta cobrança ainda não possui código Pix Copia e Cola.');
      return;
    }
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const NativeClipboard = require('@react-native-community/clipboard').default;
      NativeClipboard.setString(code);
    }
    Alert.alert('Copiado', 'Código Pix Copia e Cola copiado.');
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Pagamentos Pix</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadPayments} disabled={loading}>
          <Feather name="refresh-cw" size={18} color="#00AA95" />
        </TouchableOpacity>
      </View>
      <Text style={styles.description}>
        Acompanhe somente as suas cobranças geradas pela CSA, copie o Pix e envie o comprovante do pagamento.
      </Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}><Text style={styles.summaryValue}>{summary.pending}</Text><Text style={styles.summaryLabel}>Pendentes</Text></View>
        <View style={styles.summaryCard}><Text style={styles.summaryValue}>{summary.receipts}</Text><Text style={styles.summaryLabel}>Comprovantes</Text></View>
        <View style={styles.summaryCard}><Text style={styles.summaryValue}>{summary.approved}</Text><Text style={styles.summaryLabel}>Aprovados</Text></View>
      </View>

      {payments.length === 0 && !loading ? (
        <View style={styles.emptyCard}>
          <Feather name="inbox" size={30} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Nenhuma cobrança encontrada</Text>
          <Text style={styles.emptyText}>Toque em Atualizar depois que a CSA gerar uma cobrança vinculada ao seu usuário/pedido.</Text>
        </View>
      ) : null}

      {payments.map(payment => {
        const qrUri = qrCodes[String(payment.id)];
        const isFinal = finalStatuses.includes(payment.status);

        return (
          <View key={String(payment.id)} style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <View style={styles.paymentTitleWrapper}>
                <Text style={styles.paymentTitle}>Pedido {payment.referencia_pedido}</Text>
                <Text style={styles.paymentSubTitle}>TXID: {payment.txid || 'Não informado'}</Text>
              </View>
              <View style={styles.statusBadge}><Text style={styles.statusText}>{statusLabels[payment.status] || payment.status}</Text></View>
            </View>

            <Text style={styles.amount}>R$ {Number(payment.valor || 0).toFixed(2).replace('.', ',')}</Text>
            <Text style={styles.paymentSubTitle}>Recebedor: {payment.nome_recebedor || 'Não informado'}</Text>
            <Text style={styles.paymentSubTitle}>Chave Pix: {payment.chave_pix || 'Não informada'}</Text>

            {qrUri ? (
              <View style={styles.qrContainer}>
                <Image source={{ uri: qrUri }} style={styles.qrImage} resizeMode="contain" />
                <Text style={styles.qrHint}>Escaneie o QR Code no app do seu banco.</Text>
              </View>
            ) : (
              <View style={styles.qrContainer}>
                <Feather name="alert-circle" size={24} color="#9CA3AF" />
                <Text style={styles.qrHint}>QR Code indisponível para esta cobrança.</Text>
              </View>
            )}

            <TouchableOpacity style={styles.secondaryButton} onPress={() => copyPix(payment.pix_copia_cola)}>
              <Feather name="copy" size={16} color="#00AA95" />
              <Text style={styles.secondaryButtonText}>Copiar Pix Copia e Cola</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, isFinal || loading ? styles.disabledButton : null]}
              onPress={() => sendReceipt(payment)}
              disabled={isFinal || loading}
            >
              <Feather name="upload" size={16} color={isFinal ? '#9CA3AF' : '#00AA95'} />
              <Text style={[styles.secondaryButtonText, isFinal ? styles.disabledButtonText : null]}>
                Enviar comprovante
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 24, fontWeight: '700', color: '#292929' },
  description: { marginTop: 8, color: '#6B7280', lineHeight: 20 },
  refreshButton: { padding: 8, borderRadius: 20, backgroundColor: '#E6FFFB' },
  summaryRow: { flexDirection: 'row', gap: 8, marginVertical: 16 },
  summaryCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 12 },
  summaryValue: { fontSize: 22, fontWeight: '700', color: '#00AA95' },
  summaryLabel: { fontSize: 11, color: '#6B7280', marginTop: 4 },
  emptyCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 22, marginBottom: 14, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#292929', marginTop: 8 },
  emptyText: { color: '#6B7280', marginTop: 4, textAlign: 'center', lineHeight: 20 },
  paymentCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 16, marginBottom: 14 },
  paymentHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  paymentTitleWrapper: { flex: 1 },
  paymentTitle: { fontSize: 16, fontWeight: '700', color: '#292929' },
  paymentSubTitle: { color: '#6B7280', marginTop: 4 },
  statusBadge: { alignSelf: 'flex-start', backgroundColor: '#E6FFFB', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusText: { color: '#008577', fontSize: 12, fontWeight: '700' },
  amount: { fontSize: 20, fontWeight: '700', color: '#00AA95', marginTop: 12, marginBottom: 4 },
  qrContainer: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, marginTop: 14 },
  qrImage: { width: 220, height: 220, backgroundColor: '#FFF' },
  qrHint: { color: '#6B7280', marginTop: 8, textAlign: 'center' },
  secondaryButton: { flexDirection: 'row', alignItems: 'center', gap: 8, borderColor: '#00AA95', borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 10 },
  secondaryButtonText: { color: '#00AA95', fontWeight: '700' },
  disabledButton: { borderColor: '#D1D5DB', backgroundColor: '#F3F4F6' },
  disabledButtonText: { color: '#9CA3AF' },
});

export default Payments;
