// Manually created W layer lookup table
// This ensures the W.BCH.SUN mapping is correct (numericCode: "003")

export const W_LAYER_LOOKUP = {
  // Categories
  "BCH": {
    "numericCode": "004",
    "name": "Beach"
  },
  "CST": {
    "numericCode": "005",
    "name": "Coast"
  },
  "DCL": {
    "numericCode": "006",
    "name": "Dance Club"
  },
  
  // Subcategories - Beach
  "BCH.SUN": {
    "numericCode": "003", // Important: This specifically fixes the W.BCH.SUN issue
    "name": "Sunset"
  },
  "BCH.FES": {
    "numericCode": "003",
    "name": "Festival"
  },
  "BCH.TRO": {
    "numericCode": "002",
    "name": "Tropical"
  },
  
  // Add other subcategories as needed
  "CST.FES": {
    "numericCode": "003",
    "name": "Festival"
  },
  "CST.LIV": {
    "numericCode": "004",
    "name": "Live"
  },
  "DCL.CLB": {
    "numericCode": "001",
    "name": "Club"
  },
  "DCL.NIT": {
    "numericCode": "002",
    "name": "Night"
  }
};

export const W_SUBCATEGORIES = {
  "BCH": [
    "BCH.SUN",
    "BCH.FES",
    "BCH.TRO"
  ],
  "CST": [
    "CST.FES",
    "CST.LIV"
  ],
  "DCL": [
    "DCL.CLB",
    "DCL.NIT"
  ]
};