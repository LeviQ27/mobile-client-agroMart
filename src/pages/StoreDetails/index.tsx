/* eslint-disable camelcase */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, FlatList, Linking, Alert, Modal, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import initializeApi from '../../services/api';
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
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
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

    setSelectedPlan(planos.find(p => Number(p.id) === Number(item.id)) || item);
  };

  const subscribe = () => {
    const item = selectedPlan;
    if (!item) return;
    if (!user) return Alert.alert('Autenticação', 'Faça login para assinar um plano.');
    Alert.alert('Confirmar assinatura', `Contratar ${item.nome || item.name}? O pagamento Pix aparecerá em Meus Pagamentos.`, [
      { text:'Cancelar', style:'cancel' },
      { text:'Assinar', onPress:async () => {
        try {
          const api=await initializeApi();
          await api.post('assinaturas/contratar',{planoId:item.id,lojaId:id});
          setSelectedPlan(null); Alert.alert('Assinatura criada','Abra Meus Pagamentos para pagar a primeira cobrança Pix.');
        }catch(e:any){Alert.alert('Erro',e?.response?.data?.error?.message||'Não foi possível contratar este plano.');}
      }}
    ]);
  };

  return (
    <Container>
      <Modal visible={!!selectedPlan} transparent animationType="slide" onRequestClose={() => setSelectedPlan(null)}>
        <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'center',padding:18}}>
          <ScrollView style={{backgroundColor:'#fff',borderRadius:14,padding:18,maxHeight:'85%'}}>
            <Text style={{fontSize:24,fontWeight:'bold',marginBottom:12}}>{selectedPlan?.nome || selectedPlan?.name}</Text>
            <Text style={{marginBottom:16}}>{selectedPlan?.descricao || selectedPlan?.description || 'Sem descrição.'}</Text>
            <Text style={{fontSize:18,fontWeight:'600',marginBottom:10}}>Cestas incluídas</Text>
            {((selectedPlan?.cestas?.data || selectedPlan?.cestas || []) as any[]).map((basket:any) => {
              const b = basket.attributes || basket;
              const fromStore = cestas.find(c => Number(c.id) === Number(basket.id)) || {};
              const imageUrl = getImage(b) || getImage(fromStore);
              return <View key={basket.id} style={{marginBottom:16}}>{imageUrl ? <Image source={{uri:imageUrl.startsWith('http') ? imageUrl : `${(process.env.EXPO_PUBLIC_API_URL || 'http://localhost:1337').replace(/\/api\/?$/, '')}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`}} style={{width:'100%',height:130,borderRadius:8}} /> : null}<Text style={{fontWeight:'600',marginTop:6}}>{b.nome || 'Cesta'}</Text></View>;
            })}
            <Text style={{fontSize:17,marginBottom:12}}>R$ {getValue(selectedPlan).toFixed(2)} por ciclo</Text>
            <TouchableOpacity onPress={subscribe} style={{backgroundColor:'#27834c',padding:13,borderRadius:8,marginBottom:10}}><Text style={{color:'#fff',textAlign:'center',fontWeight:'bold'}}>Assinar plano</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedPlan(null)} style={{padding:13,marginBottom:15}}><Text style={{textAlign:'center'}}>Voltar</Text></TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
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
