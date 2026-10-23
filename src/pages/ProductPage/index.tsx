import React, { useState, useEffect } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { Alert, View, Text, TouchableOpacity } from 'react-native';
import { useCart, TypeItem } from '../../hooks/CartProvider';
import { useAuth } from '../../hooks/AuthProvider';

import BackHeader from '../../components/BackHeader';
import ProductViewCard from '../../components/ProductViewCard';
import QuantityInput from '../../components/QuantityInput';
import Button from '../../components/Button';

import { colors } from '../../styles';

import {
  Container,
  ProductContainer,
  RowView,
  ButtonContainer,
} from './styles';
import { StackNavigationProp } from '@react-navigation/stack';

type ParamList = {
  ProductPage: {
    id: number;
    type: TypeItem;
    name: string;
    quantity: number;
    value: number;
    image: string;
    description: string;
    storeId: number;
    unity?: string;
  };
};

const Product: React.FC = () => {
  const { cart, addItemToCart, removeItemToCart } = useCart();
  const { user } = useAuth();
  const [hasOnCart, setHasOnCart] = useState(false);
  const [wishQuantity, setWishQuantity] = useState(1);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'g'>('kg');

type NavigationProp = {
  Cart: undefined
}

  const navigation = useNavigation<StackNavigationProp<NavigationProp>>();
  const {
    params: { id, name, type, quantity, value, image, description, storeId, unity },
  } = useRoute<RouteProp<ParamList, 'ProductPage'>>();

  const weightBased = ['kg', 'quilo', 'quilograma'].includes(String(unity || '').toLowerCase());
  const step = weightBased && weightUnit === 'g' ? 100 : 1;
  const actualQuantity = weightBased && weightUnit === 'g' ? wishQuantity / 1000 : wishQuantity;
  const availableQuantity = Number(quantity || 0);
  const maxQuantity = availableQuantity > 1 ? availableQuantity : 99;

  useEffect(() => {
    const foundItem = cart.find(item => item.id === id && item.type === type);

    if (foundItem) {
      setHasOnCart(true);
      setWishQuantity(weightBased && weightUnit === 'g' ? Math.max(100, Math.round(foundItem.quantity * 1000)) : foundItem.quantity);
    } else {
      setHasOnCart(false);
      setWishQuantity(1);
    }
  }, [cart, id, type, weightBased]);

  const incrementQuantity = () => {
    setWishQuantity(prevState => Math.min(prevState + step, weightBased && weightUnit === 'g' ? maxQuantity * 1000 : maxQuantity));
  };

  const decrementQuantity = () => {
    setWishQuantity(prevState => Math.max(prevState - step, step));
  };

  const handleAddItem = () => {
    if (!user) {
      return Alert.alert('Ops..', 'Você deve estar logado para fazer pedidos');
    }

    if (actualQuantity <= 0) {
      return Alert.alert('Ops..', 'Informe ao menos uma unidade para adicionar ao carrinho.');
    }

    const item = {
      id,
      name,
      quantity: actualQuantity,
      stock: maxQuantity,
      image,
      value,
      type,
    };

    addItemToCart(item, storeId);
    return item.quantity !== 0 && navigation.navigate('Cart');
  };

  return (
    <Container>
      <BackHeader text={name} />
      <ProductContainer>
        <ProductViewCard
          description={description}
          value={value}
          image={image || ''}
        />
      </ProductContainer>

      {weightBased && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 14 }}>
          {(['kg', 'g'] as const).map(unit => <TouchableOpacity key={unit} onPress={() => { setWeightUnit(unit); setWishQuantity(unit === 'g' ? 100 : 1); }} style={{ padding: 10, marginHorizontal: 6, borderRadius: 6, backgroundColor: weightUnit === unit ? '#d9eddf' : '#eeeeee' }}><Text>{unit}</Text></TouchableOpacity>)}
        </View>
      )}
      <RowView>
        <QuantityInput
          value={wishQuantity}
          addFunction={() => incrementQuantity()}
          subFunction={() => decrementQuantity()}
        />
        <ButtonContainer>
          <Button onPress={handleAddItem}>
            {hasOnCart ? 'Atualizar' : 'Adicionar'}
          </Button>
        </ButtonContainer>
        {hasOnCart && (
          <ButtonContainer>
            <Button
              onPress={() => removeItemToCart(id, type)}
              style={{ backgroundColor: `${colors.red}` }}
            >
              Remover
            </Button>
          </ButtonContainer>
        )}
      </RowView>
    </Container>
  );
};

export default Product;
