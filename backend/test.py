from random import seed
from random import random
from random import randint

seed(1)

def getrand():
    value = randint(0,10)
    yield value

for i in range(1000):
    gen = getrand()
    print(next(gen))
