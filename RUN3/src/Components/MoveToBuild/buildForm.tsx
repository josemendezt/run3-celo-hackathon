import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { SafeAreaView, View, KeyboardAvoidingView, Platform } from 'react-native'
import { Button, Card, Input, Text } from '@ui-kitten/components'
import { styles } from './style'
import { globalStyles } from '../../utils/globalStyles'
import { createRoute } from '../../api/routes/routes'
import { LocationObjectCoords } from 'expo-location'
import { GeoPoint } from 'firebase/firestore'
import { useRoute } from '../../hooks/useRoute'
import { useRun3T } from '../../hooks/useRUN3T'
import { useNavigation } from '@react-navigation/native'

const Header = (props: any) => (
  <View {...props}>
    <Text category="h6">Build Route</Text>
  </View>
)

export const BuildForm = ({
  closeForm,
  routeCoords,
  setRouteCoords,
  cost,
  setIsLoading,
}: {
  closeForm: () => void
  setRouteCoords: Dispatch<SetStateAction<(LocationObjectCoords & { id: number })[]>>
  setIsLoading: Dispatch<SetStateAction<boolean>>
  routeCoords: (LocationObjectCoords & { id: number })[]
  cost: number
}) => {
  const [des, setDes] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const { mintRoute } = useRoute()
  const { transferRun3TtoContract } = useRun3T()
  const navigation = useNavigation() as any

  const buildRoute = async () => {
    setIsLoading(true)
    closeForm()
    const payload = {
      coordinates: routeCoords.map((route) => new GeoPoint(route.latitude, route.longitude)),
      date: new Date().toLocaleDateString(),
      title,
      description: des,
    }
    try {
      const payment = await transferRun3TtoContract(cost)
      if (payment) {
        const res: any = await createRoute(payload)

        await mintRoute(res.id)
        setIsLoading(false)
        navigation.navigate('routeDetail', res.id)
        setRouteCoords([])
      } else {
        alert('There was an error, please try again')
      }
    } catch (e) {
      console.log('error', e)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.cardForm} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Card
        header={Header}
        footer={(props: any) => (
          <View {...props} style={[props.style, styles.footerContainer]}>
            <Button onPress={closeForm} style={styles.footerControl} size="small" status="basic">
              CANCEL
            </Button>
            <Button
              onPress={() => {
                buildRoute()
              }}
              style={[styles.footerControl, globalStyles.primaryBg]}
              size="small"
            >
              ACCEPT
            </Button>
          </View>
        )}
      >
        <Input
          removeClippedSubviews={false}
          style={styles.formInput}
          onChangeText={(e) => {
            setTitle(e)
          }}
          placeholder="Title"
        />
        <Input
          removeClippedSubviews={false}
          style={styles.formInput}
          onChangeText={(e) => {
            setDes(e)
          }}
          placeholder="Description"
        />
      </Card>
    </KeyboardAvoidingView>
  )
}
