import axios from 'axios';

export const getAuthErrorMessage = (error: unknown, apiUrl?: string): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const message =
        error.response.data?.error?.message ||
        error.response.data?.message ||
        'Verifique e-mail, senha e permissões do usuário na API.';

      return `Erro ${error.response.status}: ${message}`;
    }

    if (error.code === 'ECONNABORTED') {
      return `Tempo esgotado ao conectar na API${apiUrl ? ` (${apiUrl})` : ''}.`;
    }

    if (error.message === 'Network Error') {
      return `Não foi possível conectar na API${apiUrl ? ` (${apiUrl})` : ''}. No celular físico, não use localhost. Use o IP do computador na rede, por exemplo http://192.168.1.21:1337, e confirme que a API está rodando acessível na rede.`;
    }

    return error.message;
  }

  return 'Erro inesperado. Verifique a conexão com a API.';
};
