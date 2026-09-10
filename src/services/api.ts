import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_API_URL = 'http://localhost:1337';

const getConfiguredApiUrl = (): string => {
  // Em builds Expo, variáveis públicas precisam começar com EXPO_PUBLIC_.
  // Para celular físico, use o IP LAN do computador, por exemplo:
  // EXPO_PUBLIC_API_URL=http://192.168.1.21:1337
  return process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;
};

export const normalizeApiBaseUrl = (url?: string | null): string => {
  const rawUrl = (url || getConfiguredApiUrl()).trim();
  const withoutTrailingSlash = rawUrl.replace(/\/+$/, '');

  if (withoutTrailingSlash.endsWith('/api')) {
    return `${withoutTrailingSlash}/`;
  }

  return `${withoutTrailingSlash}/api/`;
};

export const resolveApiBaseUrl = async (): Promise<string> => {
  const envBaseUrl = process.env.EXPO_PUBLIC_API_URL;

  // A variável de ambiente tem prioridade. Isso evita que um valor antigo salvo
  // em @BaseUrlChosen, como localhost, quebre o login no celular físico.
  if (envBaseUrl) {
    return normalizeApiBaseUrl(envBaseUrl);
  }

  const storedBaseUrl = await AsyncStorage.getItem('@BaseUrlChosen');
  return normalizeApiBaseUrl(storedBaseUrl || DEFAULT_API_URL);
};

const initializeApi = async (): Promise<AxiosInstance> => {
  const apiBaseURL = await resolveApiBaseUrl();
  const token = await AsyncStorage.getItem('@Agromart:token');

  const api = axios.create({
    baseURL: apiBaseURL,
    timeout: 15000,
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });

  return api;
};

export default initializeApi;
