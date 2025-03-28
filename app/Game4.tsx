import { Text, View, StyleSheet, ImageBackground, TextInput, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { useRef, useState} from "react";
export default function Game4() {
  const [value1, setValue1] = useState(0);
  const [value2, setValue2] = useState(0);
  const [count, setCount] = useState(1);
  const rest1 = useRef<TextInput>(null);
  const rest2 = useRef<TextInput>(null);
  const rest3 = useRef<TextInput>(null);
  const reset = () => {
    rest2.current?.setNativeProps({ text: "1" });
    rest1.current?.clear();
    rest3.current?.clear();
    setValue1(0);
    setValue2(0);
    setCount(1);
  };

  return (
    <ImageBackground source={require("../assets/images/calc.jpg")} style={styles.background}>
      <View style={styles.container}>
        <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%", marginBottom: 30}}>
          <View style={{ alignItems: "center" ,width:"30%"}}>
            <Text style={styles.text}>السعر الرسمي</Text>
            <TextInput
              placeholder="السعر الرسمي"
              style={styles.input}
              keyboardType="numeric"
              ref={rest1}
              onChangeText={(num) => {
                setValue1(Number(num) * count);
              }} />
          </View>
          <View style={{ alignItems: "center" ,width:"30%"}}>
            <Text style={styles.text}>عدد الأجهزة</Text>
            <TextInput
              placeholder="عدد الأجهزة"
              style={styles.input}
              keyboardType="numeric"
              ref={rest2}
              onChangeText={(num) => {
                if (Number(num) > 0) {
                  setValue1(Number(num) * value1 / count);
                  setValue2(Number(num) * value2 / count);
                  setCount(Number(num));
                }
              }} />
          </View>
          <View style={{ alignItems: "center" ,width:"30%"}}>
            <Text style={styles.text}>سعر البيع</Text>
            <TextInput
              placeholder="سعر البيع"
              style={styles.input}
              keyboardType="numeric"
              ref={rest3}
              onChangeText={(num) => {
                setValue2(Number(num) * count);
              }} />
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 10, borderRadius: 20, borderWidth: 5, paddingVertical: 5, paddingHorizontal: 2 }}>
          <View>
            <Text style={styles.text}>
              {`المخصوم من الرصيد\n${value1 / 4}`}
            </Text>
            <Text style={styles.text}>
              {`اجمالي الخسارة\n${value1 - value2}`}
            </Text>
          </View>
          <View>
            <Text style={styles.text}>
              {`القسط الشهري\n${Math.ceil(value1 / 60)}`}
            </Text>
            <Text style={styles.text}>
              {`خسارة السنة الواحدة\n${Math.ceil((value1 - value2) / 5)} = %${(((value1 - value2) / 5) / (value2 / 100)).toFixed(2)}`}
            </Text>
          </View>
        </View>
        <Text style={styles.text}>{`عدد ${count} شهادة بعائد 27% بمبلغ ${value2}`}</Text>
        <View style={{ width: "90%", borderRadius: 20, borderWidth: 5, paddingVertical: 5 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            <View>
              <Text style={styles.text}>
                {`العائد السنوي\n${(value2 * 27 / 100)}`}
              </Text>
            </View>
            <View>
              <Text style={styles.text}>
                {`العائد الشهري\n${((value2 * 27 / 100) / 12).toFixed(2)}`}
              </Text>
            </View>
          </View>
          <Text style={styles.text}>
            {`مطلوب علي العائد لدفع القسط\n${((Math.ceil(value1 / 60)) - (((value2 * 27 / 100) / 12))).toFixed(2)}`}
          </Text>
        </View>
        <Link href="/" style={styles.link}>Go Back Home</Link>
        <TouchableOpacity style={styles.resetButton} onPress={reset}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    width: '100%',
    height: '100%',
  },
  text: {
    fontSize: 21,
    color: "red",
    fontWeight: "bold",
    textAlign: "center",
    borderWidth: 3,
    padding: 4,
    borderRadius: 20,
    marginTop: 2,
    marginRight: 1,
    marginLeft: 1,
    marginBottom: 2,

  },
  link: {
    fontSize: 20,
    color: "cyan",
    marginTop: 20,
    borderWidth: 4,
    padding: 10,
    borderRadius: 20,
  },
  input: {
    backgroundColor: "lightblue",
    width: "80%",
    padding: 10,
    borderRadius: 15,
    marginTop: 10,
  },
  resetButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "cyan",
    borderRadius: 20,
    width: 150,
  },
  resetButtonText: {
    fontSize: 18,
    textAlign: "center",
    color: "black",
    fontWeight: "bold"
  },
});
