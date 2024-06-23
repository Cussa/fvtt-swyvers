export const cases = [
  {
    pouch: [22, 7, 3],
    price: [100, 0, 0],
    expectedResult: false,
    expectedPouch: [22, 7, 3]
  },
  {
    pouch: [22, 7, 3],
    price: [0, 1000, 0],
    expectedResult: false,
    expectedPouch: [22, 7, 3]
  },
  {
    pouch: [22, 7, 3],
    price: [0, 0, 10000],
    expectedResult: false,
    expectedPouch: [22, 7, 3]
  },
  {
    pouch: [22, 7, 3],
    price: [0, 0, 2],
    expectedResult: true,
    expectedPouch: [22, 7, 1]
  },
  {
    pouch: [22, 7, 3],
    price: [0, 2, 0],
    expectedResult: true,
    expectedPouch: [22, 5, 3]
  },
  {
    pouch: [22, 7, 13],
    price: [0, 2, 0],
    expectedResult: true,
    expectedPouch: [22, 6, 3]
  },
  {
    pouch: [22, 7, 2],
    price: [1, 0, 0],
    expectedResult: true,
    expectedPouch: [21, 7, 2]
  },
  {
    pouch: [22, 17, 3],
    price: [1, 0, 0],
    expectedResult: true,
    expectedPouch: [22, 7, 3]
  },
  {
    pouch: [20, 15, 2],
    price: [0, 0, 5],
    expectedResult: true,
    expectedPouch: [20, 14, 7]
  },
  {
    pouch: [0, 0, 3],
    price: [0, 0, 5],
    expectedResult: false,
    expectedPouch: [0, 0, 3]
  },
  {
    pouch: [0, 3, 0],
    price: [0, 0, 5],
    expectedResult: true,
    expectedPouch: [0, 2, 5]
  },
  {
    pouch: [0, 3, 2],
    price: [0, 0, 5],
    expectedResult: true,
    expectedPouch: [0, 2, 7]
  },
  {
    pouch: [1, 0, 0],
    price: [0, 0, 12],
    expectedResult: true,
    expectedPouch: [0, 8, 8]
  },
  {
    pouch: [1, 0, 12],
    price: [0, 2, 0],
    expectedResult: true,
    expectedPouch: [0, 9, 2]
  },
  {
    pouch: [0, 0, 222],
    price: [1, 0, 0],
    expectedResult: true,
    expectedPouch: [0, 0, 122]
  },
  {
    pouch: [0, 0, 222],
    price: [0, 10, 0],
    expectedResult: true,
    expectedPouch: [0, 0, 122]
  },
  {
    pouch: [0, 3, 222],
    price: [1, 0, 0],
    expectedResult: true,
    expectedPouch: [0, 3, 122]
  },
  {
    pouch: [0, 15, 2],
    price: [1, 0, 0],
    expectedResult: true,
    expectedPouch: [0, 5, 2]
  },
  {
    pouch: [0, 15, 82],
    price: [2, 0, 0],
    expectedResult: true,
    expectedPouch: [0, 3, 2]
  },
  {
    pouch: [3, 0, 12],
    price: [0, 13, 0],
    expectedResult: true,
    expectedPouch: [1, 8, 2]
  },
  {
    pouch: [5, 0, 12],
    price: [1, 13, 0],
    expectedResult: true,
    expectedPouch: [2, 8, 2]
  },
  {
    pouch: [0, 19, 0],
    price: [0, 10, 4],
    expectedResult: true,
    expectedPouch: [0, 8, 6]
  },
  {
    pouch: [5, 5, 5],
    price: [2, 3, 4],
    expectedResult: true,
    expectedPouch: [3, 2, 1]
  },
  {
    pouch: [5, 5, 5],
    price: [2, 8, 7],
    expectedResult: true,
    expectedPouch: [2, 6, 8]
  },
];