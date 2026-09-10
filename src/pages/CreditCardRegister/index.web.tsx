import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CreditCardRegister: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro de cartão</Text>
      <Text style={styles.description}>
        Esta tela utiliza componentes nativos no aplicativo Android/iOS. No modo web,
        ela fica indisponível para evitar tela branca durante a execução pelo navegador.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          Alert.alert('Modo web', 'Cadastro de cartão disponível no app mobile nativo.');
          navigation.goBack();
        }}
      >
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#292929',
    marginBottom: 12,
  },
  description: {
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#00AA95',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default CreditCardRegister;
