import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View, Switch, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import initializeApi from '../../services/api';
import BackHeader from '../../components/BackHeader';
type Subscription={id:number;status:string;periodicidade:string;valor_por_ciclo:number;proxima_cobranca:string;pular_proxima_cesta:boolean;plano?:{nome:string};loja?:{nome:string}};
const unpack=(response:any)=>{const raw=response?.data?.data||response?.data||[];return (Array.isArray(raw)?raw:[]).map((x:any)=>({id:x.id,...(x.attributes||x)}));};
const Plan:React.FC=()=>{
 const [plans,setPlans]=useState<Subscription[]>([]);const [loading,setLoading]=useState(true);
 const load=useCallback(async()=>{setLoading(true);try{const api=await initializeApi();setPlans(unpack(await api.get('assinaturas/me')));}catch(e:any){Alert.alert('Erro',e?.response?.data?.error?.message||'Não foi possível carregar suas assinaturas');}finally{setLoading(false);}},[]);
 useFocusEffect(useCallback(()=>{load();},[load]));
 const update=async(id:number,action:'pular'|'cancelar',value?:boolean)=>{
  try{const api=await initializeApi();await api.put(`assinaturas/${id}/${action}`,action==='pular'?{pular:value}:{});await load();}catch(e:any){Alert.alert('Erro',e?.response?.data?.error?.message||'Não foi possível atualizar a assinatura');}
 };
 return <View style={{flex:1,backgroundColor:'#fff'}}><BackHeader text="Minhas assinaturas" />
  {loading?<ActivityIndicator style={{marginTop:35}}/>:<ScrollView contentContainerStyle={{padding:18}}>
   {!plans.length&&<Text>Você ainda não possui assinaturas.</Text>}
   {plans.map(p=><View key={p.id} style={{borderWidth:1,borderColor:'#ddd',borderRadius:12,padding:16,marginBottom:14}}>
    <Text style={{fontSize:20,fontWeight:'bold',marginBottom:8}}>{p.plano?.nome||`Plano #${p.id}`}</Text>
    <Text>Loja: {p.loja?.nome||'—'}</Text><Text>Periodicidade: {p.periodicidade==='SEMANAL'?'Semanal':'Mensal'}</Text>
    <Text>Valor por ciclo: R$ {Number(p.valor_por_ciclo).toFixed(2)}</Text><Text>Status: {p.status}</Text>
    <Text>Próxima cobrança: {new Date(p.proxima_cobranca).toLocaleDateString('pt-BR')}</Text>
    {p.status==='ATIVA'&&<><View style={{flexDirection:'row',alignItems:'center',marginTop:12}}><Text style={{flex:1}}>Pular próxima cesta</Text><Switch value={Boolean(p.pular_proxima_cesta)} onValueChange={v=>update(p.id,'pular',v)}/></View>
    <TouchableOpacity onPress={()=>Alert.alert('Cancelar assinatura','Cancelar as próximas renovações?', [{text:'Voltar',style:'cancel'},{text:'Cancelar assinatura',style:'destructive',onPress:()=>update(p.id,'cancelar')}])} style={{marginTop:10}}><Text style={{color:'#b71c1c'}}>Cancelar assinatura</Text></TouchableOpacity></>}
   </View>)}
  </ScrollView>}</View>;
};
export default Plan;
