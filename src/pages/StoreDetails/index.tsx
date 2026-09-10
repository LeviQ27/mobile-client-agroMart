/* eslint-disable camelcase */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, FlatList, Linking, Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

import { useCart, TypeItem } from '../../hooks/CartProvider';
import { useAuth } from '../../hooks/AuthProvider';

import BackHeader from '../../components/BackHeader';
import ProductCard from '../../components/ProductCard';

import {
  Container,
  BackHeaderContainer,
  Header,
  StoreBanner,
  HeaderContent,
  Title,
  StoreRA,
  SubTitle,
  Separator,
  Content,
  Touchable,
  ContainerItem,
  MenuItem,
  TitleContainer,
  TitleMenu,
  IconView,
} from './styles';

interface Category {
  id: number;
  title: string;
  data: Item[];
}

interface Item {
  id: number;
  type: TypeItem;
  name: string;
  quantity: number;
  value: number;
  image: string;
  unity: string;
  description?: string;
  storeId: number;
}

type ParamList = {
  StoreDetails: {
    id: number;
    nome: string;
    contato: string;
    descricao: string;
    banner?: { url: string } | null;
    produto_avulsos?: any[];
    cestas?: any[];
    planos?: any[];
    endereco?: { bairro?: string };
  };
};

type NavigationProps = {
  ProductPage: Item;
  Cart: undefined;
};

const getImage = (item: any) => item?.url || item?.imagem?.url || item?.imagem?.data?.attributes?.url || '';
const getValue = (item: any) => Number(item?.valor || item?.value || 0);
const getQuantity = (item: any) => Number(item?.quantidade || item?.quantity || 0);

const StoreDetails: React.FC = () => {
  const [selectedMenu, setSelectedMenu] = useState(0);
  const navigation = useNavigation<StackNavigationProp<NavigationProps>>();
  const [data, setData] = useState<Category[]>([]);
  const { addItemToCart, cart } = useCart();
  const { user } = useAuth();

  const {
    params: {
      id,
      nome,
      contato,
      descricao,
      banner,
      produto_avulsos = [],
      cestas = [],
      planos = [],
      endereco = {},
    },
  } = useRoute<RouteProp<ParamList, 'StoreDetails'>>();

  useEffect(() => {
    setData([
      {
        id: 1,
        title: 'Cestas',
        data: cestas.map(item => ({
          id: item.id,
          name: item.nome || `Cesta ${item.id}`,
          type: 'cesta' as TypeItem,
          image: getImage(item),
          quantity: getQuantity(item),
          value: getValue(item),
          unity: 'unidade',
          description: item.descricao,
          storeId: id,
        })),
      },
      {
        id: 2,
        title: 'Planos',
        data: planos.map(item => ({
          id: item.id,
          type: 'plano' as TypeItem,
          name: item.nome || `Plano ${item.id}`,
          image: getImage(item),
          quantity: getQuantity(item) || 1,
          value: getValue(item),
          unity: 'unidade',
          description: item.descricao,
          storeId: id,
        })),
      },
      {
        id: 3,
        title: 'Produtos',
        data: produto_avulsos.map(item => ({
          id: item.id,
          type: 'produto' as TypeItem,
          name: item.nome || `Produto ${item.id}`,
          image: getImage(item),
          quantity: getQuantity(item),
          value: getValue(item),
          unity: item.unidade_medida || 'unidade',
          description: item.descricao,
          storeId: id,
        })),
      },
    ]);
  }, [cestas, planos, produto_avulsos, id]);

  const selectedCategory = useMemo(() => data[selectedMenu] || data[0], [data, selectedMenu]);

  const handleWhatsAppMessage = useCallback(async (phoneNumber: string): Promise<void> => {
    if (!phoneNumber) return Alert.alert('Contato indisponível', 'Esta loja ainda não possui telefone cadastrado.');
    await Linking.openURL(`https://wa.me/55${String(phoneNumber).replace(/\D/g, '')}`).catch(err => console.log(err));
  }, []);

  const selectMenu = useCallback((index: number) => {
    setSelectedMenu(index);
  }, []);

  const handleItemPress = (item: Item) => {
    if (item.type !== 'plano') {
      return navigation.navigate('ProductPage', item);
    }

    if (!user) {
      return Alert.alert('Ops...', 'Você deve estar logado para adicionar um plano ao carrinho.');
    }

    addItemToCart({
      id: item.id,
      name: item.name,
      quantity: 1,
      stock: item.quantity || 1,
      image: item.image,
      value: item.value,
      type: 'plano',
    }, id);

    return navigation.navigate('Cart');
  };

  return (
    <Container>
      <BackHeaderContainer>
        <BackHeader />
      </BackHeaderContainer>
      <Header>
        {banner?.url ? <StoreBanner source={{ uri: banner.url }} /> : null}
        <HeaderContent>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Title>{nome}</Title>
              <StoreRA>{endereco?.bairro || 'Região não informada'}</StoreRA>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconView
                onPress={() => {
                  if (!cart.length) {
                    if (!user) return Alert.alert('Ops...', 'Você deve estar logado para acessar o carrinho.');
                    return Alert.alert('Ops...', 'Seu carrinho está vazio');
                  }
                  return navigation.navigate('Cart');
                }}
              >
                <MaterialCommunityIcons name="cart" size={23} color="#fff" />
              </IconView>
              <IconView onPress={() => handleWhatsAppMessage(contato)}>
                <MaterialCommunityIcons name="whatsapp" size={23} color="#fff" />
              </IconView>
            </View>
          </View>

          <Separator />
          <SubTitle>{descricao || 'Esta loja ainda não possui descrição cadastrada.'}</SubTitle>
          <Separator />
        </HeaderContent>
      </Header>

      <Content>
        <View>
          <FlatList
            data={data}
            keyExtractor={item => String(item.id)}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <Touchable onPress={() => selectMenu(index)}>
                <ContainerItem selected={index === selectedMenu}>
                  <MenuItem selected={index === selectedMenu}>{item.title}</MenuItem>
                </ContainerItem>
              </Touchable>
            )}
            horizontal
          />
        </View>

        <TitleContainer>
          <TitleMenu>{selectedCategory?.title || 'Itens'}</TitleMenu>
        </TitleContainer>

        <FlatList
          data={selectedCategory?.data || []}
          keyExtractor={item => `${item.type}-${item.id}`}
          ListEmptyComponent={() => (
            <SubTitle style={{ padding: 16 }}>Nenhum item cadastrado nesta aba.</SubTitle>
          )}
          renderItem={({ item }) => (
            <ProductCard
              image={item.image}
              name={item.name}
              quantity={item.quantity}
              value={item.value}
              onPress={() => handleItemPress(item)}
            />
          )}
        />
      </Content>
    </Container>
  );
};

export default StoreDetails;
