import { Text, View, StyleSheet, ImageBackground, TextInput, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { useRef, useState} from "react";
export default function Game5() {
  const [value1, setValue1] = useState(0);
  const [value2, setValue2] = useState(0);
  const [value3, setValue3] = useState(0);
  const [value4, setValue4] = useState(0);
  const [value5, setValue5] = useState(0);
  const [value6, setValue6] = useState(0);
  const [count1, setCount1] = useState(1);
  const [count2, setCount2] = useState(1);
  const [count3, setCount3] = useState(1);
  const [count4, setCount4] = useState(1);
  const [count5, setCount5] = useState(1);
  const [count6, setCount6] = useState(1);
  
  const rest1 = useRef<TextInput>(null);
  const rest2 = useRef<TextInput>(null);
  const rest3 = useRef<TextInput>(null);
  const reset = () => {
    rest2.current?.setNativeProps({ text: "1" });
    rest1.current?.clear();
    rest3.current?.clear();
    setValue1(0);
    setValue2(0);
    setValue3(0);
    setValue4(0);
    setValue5(0);
    setValue6(0);
    setCount1(1);
    setCount2(1);
    setCount3(1);
    setCount4(1);
    setCount5(1);
    setCount6(1);


  };

  return (
    <ImageBackground source={require("../assets/images/calc.jpg")} style={styles.background}>
      <View style={styles.container}>
        {/* <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%", marginBottom: 30}}>
          <View style={{ alignItems: "center" ,width:"34%"}}>
            <Text style={styles.text}>السعر الرسمي</Text>
            <TextInput
              placeholder="السعر الرسمي"
              style={styles.input}
              keyboardType="numeric"
              ref={rest1}
              onChangeText={(num) => {
                setValue1(Number(num) * count1);
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
                  setValue1(Number(num) * value1 / count1);
                  setValue2(Number(num) * value2 / count1);
                  setCount1(Number(num));
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
                setValue2(Number(num) * count1);
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
        <Text style={styles.text}>{`عدد ${count1} شهادة بعائد 27% بمبلغ ${value2}`}</Text> */}
        <View style={{ width: "90%", borderRadius: 20, borderWidth: 5, paddingVertical: 5 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            <View>
              <Text style={styles.text}>
                {`14C 4/128`}
              </Text>
            </View>
            <View style={{ alignItems: "center" , width:"30%"}}>
              <TextInput
                placeholder="العدد"
                style={styles.input}
                keyboardType="numeric"
                onChangeText={(num) => {
                  setCount1(Number(num));
                }} />
            </View>
            <View style={{ alignItems: "center" , width:"30%"}}>
            <TextInput
                placeholder="القيمة"
                style={styles.input}
                keyboardType="numeric"
                onChangeText={(num) => {
                  setValue1(Number(num));
                }} />
            </View>
          </View>
        </View>

        <View style={{ width: "90%", borderRadius: 20, borderWidth: 5, paddingVertical: 5 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            <View>
              <Text style={styles.text}>
                {`14C 6/128`}
              </Text>
            </View>
            <View style={{ alignItems: "center" , width:"30%"}}>
              <TextInput
                placeholder="العدد"
                style={styles.input}
                keyboardType="numeric"
                onChangeText={(num) => {
                  setCount2(Number(num));
                }} />
            </View>
            <View style={{ alignItems: "center" , width:"30%"}}>
            <TextInput
                placeholder="القيمة"
                style={styles.input}
                keyboardType="numeric"
                onChangeText={(num) => {
                  setValue2(Number(num));
                }} />
            </View>
          </View>
        </View>


        <View style={{ width: "90%", borderRadius: 20, borderWidth: 5, paddingVertical: 5 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            <View>
              <Text style={styles.text}>
                {`14C 8/256`}
              </Text>
            </View>
            <View style={{ alignItems: "center" , width:"30%"}}>
              <TextInput
                placeholder="العدد"
                style={styles.input}
                keyboardType="numeric"
                onChangeText={(num) => {
                  setCount3(Number(num));
                }} />
            </View>
            <View style={{ alignItems: "center" , width:"30%"}}>
            <TextInput
                placeholder="القيمة"
                style={styles.input}
                keyboardType="numeric"
                onChangeText={(num) => {
                  setValue3(Number(num));
                }} />
            </View>
          </View>
        </View>


        <View style={{ width: "90%", borderRadius: 20, borderWidth: 5, paddingVertical: 5 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            <View>
              <Text style={styles.text}>
                {`A3 4/128`}
              </Text>
            </View>
            <View style={{ alignItems: "center" , width:"30%"}}>
              <TextInput
                placeholder="العدد"
                style={styles.input}
                keyboardType="numeric"
                onChangeText={(num) => {
                  setCount4(Number(num));
                }} />
            </View>
            <View style={{ alignItems: "center" , width:"30%"}}>
            <TextInput
                placeholder="القيمة"
                style={styles.input}
                keyboardType="numeric"
                onChangeText={(num) => {
                  setValue4(Number(num));
                }} />
            </View>
          </View>
        </View>

        <View style={{ width: "90%", borderRadius: 20, borderWidth: 5, paddingVertical: 5 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            <View>
              <Text style={styles.text}>
                {`A06 4/128`}
              </Text>
            </View>
            <View style={{ alignItems: "center" , width:"30%"}}>
              <TextInput
                placeholder="العدد"
                style={styles.input}
                keyboardType="numeric"
                onChangeText={(num) => {
                  setCount5(Number(num));
                }} />
            </View>
            <View style={{ alignItems: "center" , width:"30%"}}>
            <TextInput
                placeholder="القيمة"
                style={styles.input}
                keyboardType="numeric"
                onChangeText={(num) => {
                  setValue5(Number(num));
                }} />
            </View>
          </View>
        </View>

        <View style={{ width: "90%", borderRadius: 20, borderWidth: 5, paddingVertical: 5 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            <View>
              <Text style={styles.text}>
                {`A3x 4/128`}
              </Text>
            </View>
            <View style={{ alignItems: "center" , width:"30%"}}>
              <TextInput
                placeholder="العدد"
                style={styles.input}
                keyboardType="numeric"
                onChangeText={(num) => {
                  setCount6(Number(num));
                }} />
            </View>
            <View style={{ alignItems: "center" , width:"30%"}}>
            <TextInput
                placeholder="القيمة"
                style={styles.input}
                keyboardType="numeric"
                onChangeText={(num) => {
                  setValue6(Number(num));
                }} />
            </View>
          </View>
        </View>
        
        <Text style={styles.text}>{`الأجمال : ${(value1*count1)+(value2*count2)+(value3*count3)+(value4*count4)+(value5*count5)+(value6*count6)}`}</Text> 

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
