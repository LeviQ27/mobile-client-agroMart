import React, { useEffect, useCallback, useState } from 'react';
import { ScrollView, Alert, ActivityIndicator, Text } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/AuthProvider';
import { useStores } from '../../hooks/StoresProvider';

import { storesService } from '../../services/stores';

import UserHeader from '../../components/UserHeader';
import Carousel from '../../components/Carousel';
import StoreCard from '../../components/StoreCard';

import { Container, CarouselContainer, StoresContainer } from './styles';
import { Store } from '../../interfaces';
import { StackNavigationProp } from '@react-navigation/stack';

type NavigationProps = {
  StoreDetail: Store
}

const Home: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<NavigationProps>>();

  const { user } = useAuth();
  const { stores, updateStores } = useStores();
  const [loading, setLoading] = useState(false);

  const loadStores = useCallback(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await storesService.list();
        updateStores(data);
      } catch (err) {
        Alert.alert('Ops', 'Não foi possível carregar as lojas. Verifique a API, o .env e se existem lojas cadastradas.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [updateStores]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  useFocusEffect(loadStores);

  return (
    <Container>
      <UserHeader name={user?.username} disabled={!!user} />
      <ScrollView>
        <CarouselContainer>
          <Carousel />
        </CarouselContainer>
        {loading ? <ActivityIndicator style={{ marginTop: 16 }} /> : null}
        {!loading && stores.length === 0 ? <Text style={{ textAlign: 'center', marginTop: 16 }}>Nenhuma loja encontrada.</Text> : null}
        <StoresContainer>
          {stores.map(store => (
            <StoreCard
              key={store.id}
              name={store.nome}
              city={store.endereco?.bairro}
              image={store.banner ? store.banner.url : ''}
              onPress={() => navigation.navigate('StoreDetail', store)}
            />
          ))}
        </StoresContainer>
      </ScrollView>
    </Container>
  );
};

export default Home;
