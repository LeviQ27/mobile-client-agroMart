/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RAs from '../../utils/mockCitys';
import { colors } from '../../styles';
import {
  Container,
  Content,
  ItemList,
  ButtonContainer,
  Footer,
  TotalContainer,
  TotalText,
  TotalValue,
} from './styles';
import { priceFormat } from '../../utils';

// Components imports
import AddressShortView from '../../components/AddressShortView';
import BackHeader from '../../components/BackHeader';
import CartItemCard from '../../components/CartItemCard';
import TextButton from '../../components/TextButton';
import Button from '../../components/Button';

// Context imports
import { useAuth } from '../../hooks/AuthProvider';
import { useCart } from '../../hooks/CartProvider';
import { ordersService } from '../../services/orders';
import { StackNavigationProp } from '@react-navigation/stack';

interface StockParams {
  id: number;
  quantity: number;
  stock: number;
}


type NavigationProps = {
  History: undefined;
  AddressForm: undefined;
  Payments: undefined;
}

const CartScreen: React.FC = () => {
  const [userRA, setUserRA] = useState('');
  const [loading, setLoading] = useState(false);

  // Context
  const { user } = useAuth();
  const { cart, removeItemToCart, getTotal, storeId, cleanUpCart } = useCart();
  const navigation = useNavigation<StackNavigationProp<NavigationProps>>();

  useEffect(() => {
    const foundRA = RAs.find(RA => RA.key === user.endereco?.bairro);

    foundRA && setUserRA(foundRA?.city);
  }, [user]);

  useEffect(() => {
    if (!cart.length) {
      // navigation.navigate('StoreDetail');
    }
  }, [cart, navigation]);

  const sendSubscriberData = async () => {
    if (!storeId) {
      throw new Error('Loja do pedido não identificada.');
    }

    const pedidoBody = {
      loja: storeId,
      valor_total: getTotal(),
      tipo_entrega: 'Receber',
      itens: cart.map(item => ({
        id: item.id,
        tipo: item.type,
        nome: item.name,
        quantidade: item.quantity,
        valor_unitario: item.value,
        valor_total: item.value * item.quantity,
      })),
      observacao: 'Pedido realizado pelo mobile client AgroMart',
    };

    await ordersService.createPedido(pedidoBody);
    cleanUpCart();
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await sendSubscriberData();
      navigation.navigate('Payments');

      // VOLTAR PARA BILLING ADDRESS QUANDO ARRUMAR PAGAMENTO POR CARTÃO
      // navigation.navigate('BillingAddress');
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || error?.message || 'Não foi possível prosseguir para o pagamento.';
      Alert.alert('Ops...', message);
    }
    setLoading(false);
  };

  return (
    <Container>
      <BackHeader text="Pedidos" disabled={loading} />
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={`${colors.secondary}`} />
        </View>
      ) : (
        <>
          <AddressShortView
            RA={userRA}
            address={user.endereco ? user.endereco?.rua : ''}
            onPress={() => {
              navigation.navigate('AddressForm');
            }}
          />
          <Content>
            <ItemList>
              {cart.map(item => (
                <CartItemCard
                  name={item.name}
                  photo={item.image}
                  price={item.value * item.quantity}
                  quantity={item.quantity}
                  key={`${item.id}-${item.type}`}
                  handleDelete={() => removeItemToCart(item.id, item.type)}
                />
              ))}
            </ItemList>
            <TextButton
              onPress={() => {
                // navigation.navigate('StoreDetail');
              }}
            >
              Adicionar mais itens
            </TextButton>

            <Footer>
              <TotalContainer>
                <TotalText>Total</TotalText>
                <TotalValue>{priceFormat(getTotal())}</TotalValue>
              </TotalContainer>
              <ButtonContainer>
                <Button onPress={handleFinish}>Realizar Pedido</Button>
              </ButtonContainer>
            </Footer>
          </Content>
        </>
      )}
    </Container>
  );
};

export default CartScreen;
