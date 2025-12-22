import operator

ops_symbols = {
    "+": operator.add,
    "-": operator.sub,

}

value1, value2 = 20, 10
operator = input("Enter operator (+, -): ")

print("Calculation:", ops_symbols[operator](value1, value2))
