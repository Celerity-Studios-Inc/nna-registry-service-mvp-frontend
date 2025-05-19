export const R_LAYER_LOOKUP = {
  HST: {
    numericCode: '001',
    name: 'Host',
  },
  'HST.OWN': {
    numericCode: '001',
    name: 'Owner',
  },
  'HST.COM': {
    numericCode: '002',
    name: 'Community',
  },
  DEC: {
    numericCode: '002',
    name: 'Decision',
  },
  'DEC.LAW': {
    numericCode: '001',
    name: 'Law',
  },
};

export const R_SUBCATEGORIES = {
  HST: ['HST.OWN', 'HST.COM'],
  DEC: ['DEC.LAW'],
};
