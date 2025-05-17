// Complete lookup table for W (World) layer
// Manually created to ensure the W.BCH.SUN mapping is correct (numericCode: "003")

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
  "STG": {
    "numericCode": "001",
    "name": "Stage"
  },
  "URB": {
    "numericCode": "002",
    "name": "Urban"
  },
  "NAT": {
    "numericCode": "003",
    "name": "Nature"
  },
  "FAN": {
    "numericCode": "007",
    "name": "Fantasy"
  },
  "SCI": {
    "numericCode": "008",
    "name": "Sci-Fi"
  },

  // Subcategories - Beach
  "BCH.SUN": {
    "numericCode": "003", // CRITICAL: This specifically ensures W.BCH.SUN -> 5.004.003.001
    "name": "Sunset"
  },
  "BCH.FES": {
    "numericCode": "002",
    "name": "Festival"
  },
  "BCH.TRO": {
    "numericCode": "001",
    "name": "Tropical"
  },

  // Subcategories - Coast
  "CST.FES": {
    "numericCode": "003",
    "name": "Festival"
  },
  "CST.LIV": {
    "numericCode": "004",
    "name": "Live"
  },
  "CST.OCN": {
    "numericCode": "001",
    "name": "Ocean"
  },

  // Subcategories - Dance Club
  "DCL.CLB": {
    "numericCode": "001",
    "name": "Club"
  },
  "DCL.NIT": {
    "numericCode": "002",
    "name": "Night"
  },
  "DCL.LED": {
    "numericCode": "003",
    "name": "LED"
  },

  // Subcategories - Stage
  "STG.CNT": {
    "numericCode": "001",
    "name": "Concert"
  },
  "STG.STD": {
    "numericCode": "002",
    "name": "Stadium"
  },

  // Subcategories - Urban
  "URB.CTY": {
    "numericCode": "001",
    "name": "City"
  },
  "URB.STR": {
    "numericCode": "002",
    "name": "Street"
  },

  // Subcategories - Nature
  "NAT.FOR": {
    "numericCode": "001",
    "name": "Forest"
  },
  "NAT.DST": {
    "numericCode": "002",
    "name": "Desert"
  }
};

export const W_SUBCATEGORIES = {
  "BCH": [
    "BCH.SUN",
    "BCH.FES",
    "BCH.TRO"
  ],
  "CST": [
    "CST.OCN",
    "CST.FES",
    "CST.LIV"
  ],
  "DCL": [
    "DCL.CLB",
    "DCL.NIT",
    "DCL.LED"
  ],
  "STG": [
    "STG.CNT",
    "STG.STD"
  ],
  "URB": [
    "URB.CTY",
    "URB.STR"
  ],
  "NAT": [
    "NAT.FOR",
    "NAT.DST"
  ],
  "FAN": [],
  "SCI": []
};