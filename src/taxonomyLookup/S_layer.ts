// Complete lookup table for S (Star) layer
// Manually updated to ensure all categories and subcategories are correctly defined

export const S_LAYER_LOOKUP = {
  // Categories
  "POP": {
    "numericCode": "001",
    "name": "Pop"
  },
  "RCK": {
    "numericCode": "002",
    "name": "Rock"
  },
  "HIP": {
    "numericCode": "003",
    "name": "Hip-Hop"
  },
  "EDM": {
    "numericCode": "004",
    "name": "Electronic Dance Music"
  },
  "CNT": {
    "numericCode": "005",
    "name": "Country"
  },
  "RNB": {
    "numericCode": "006",
    "name": "R&B"
  },
  "JAZ": {
    "numericCode": "007",
    "name": "Jazz"
  },
  "CLS": {
    "numericCode": "008",
    "name": "Classical"
  },
  "REG": {
    "numericCode": "009",
    "name": "Reggae"
  },
  "LAT": {
    "numericCode": "010",
    "name": "Latin"
  },
  "MTL": {
    "numericCode": "011",
    "name": "Metal"
  },
  "FOL": {
    "numericCode": "012",
    "name": "Folk"
  },
  "BLU": {
    "numericCode": "013",
    "name": "Blues"
  },
  "IND": {
    "numericCode": "014",
    "name": "Indie"
  },

  // Subcategories - Pop
  "POP.BAS": {
    "numericCode": "001",
    "name": "Base"
  },
  "POP.DIV": {
    "numericCode": "002",
    "name": "Pop Diva Female Stars"
  },
  "POP.IDF": {
    "numericCode": "003",
    "name": "Pop Idol Female Stars"
  },
  "POP.LGF": {
    "numericCode": "004",
    "name": "Pop Legend Female Stars"
  },
  "POP.LGM": {
    "numericCode": "005",
    "name": "Pop Legend Male Stars"
  },
  "POP.ICM": {
    "numericCode": "006",
    "name": "Pop Icon Male Stars"
  },
  "POP.HPM": {
    "numericCode": "007",
    "name": "Pop Hipster Male Stars"
  },

  // Subcategories - Rock
  "RCK.BAS": {
    "numericCode": "001",
    "name": "Base"
  },
  "RCK.HRD": {
    "numericCode": "002",
    "name": "Hard Rock"
  },
  "RCK.ALT": {
    "numericCode": "003",
    "name": "Alternative"
  },
  "RCK.GRG": {
    "numericCode": "004",
    "name": "Garage"
  },

  // Subcategories - Hip Hop
  "HIP.BAS": {
    "numericCode": "001",
    "name": "Base"
  },
  "HIP.TRP": {
    "numericCode": "002",
    "name": "Trap"
  },
  "HIP.UND": {
    "numericCode": "003",
    "name": "Underground"
  },
  "HIP.OLS": {
    "numericCode": "004",
    "name": "Old School"
  },
  "HIP.RAP": {
    "numericCode": "005",
    "name": "Rap"
  },

  // Subcategories - EDM
  "EDM.BAS": {
    "numericCode": "001",
    "name": "Base"
  },
  "EDM.HOS": {
    "numericCode": "002",
    "name": "House"
  },
  "EDM.TEC": {
    "numericCode": "003",
    "name": "Techno"
  },
  "EDM.TRN": {
    "numericCode": "004",
    "name": "Trance"
  },

  // Subcategories - Country
  "CNT.BAS": {
    "numericCode": "001",
    "name": "Base"
  },

  // Subcategories - R&B
  "RNB.BAS": {
    "numericCode": "001",
    "name": "Base"
  }
};

export const S_SUBCATEGORIES = {
  "POP": [
    "POP.BAS",
    "POP.DIV",
    "POP.IDF",
    "POP.LGF",
    "POP.LGM",
    "POP.ICM",
    "POP.HPM"
  ],
  "RCK": [
    "RCK.BAS",
    "RCK.HRD",
    "RCK.ALT",
    "RCK.GRG"
  ],
  "HIP": [
    "HIP.BAS",
    "HIP.TRP",
    "HIP.UND",
    "HIP.OLS",
    "HIP.RAP"
  ],
  "EDM": [
    "EDM.BAS",
    "EDM.HOS",
    "EDM.TEC",
    "EDM.TRN"
  ],
  "CNT": [
    "CNT.BAS"
  ],
  "RNB": [
    "RNB.BAS"
  ],
  "JAZ": [],
  "CLS": [],
  "REG": [],
  "LAT": [],
  "MTL": [],
  "FOL": [],
  "BLU": [],
  "IND": []
};