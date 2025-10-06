
export const PORTALS_REQUIRING_AUTH = ['idata', 'vfs', 'asvize', 'tlscontact', 'cosmos'];

export const VISA_CENTERS: Record<string, any> = {
    DE: {
        name: 'Almanya',
        idata: {
            'Istanbul': ['Istanbul (Avrupa)', 'Istanbul (Asya)'],
            'Ankara': ['Ankara'],
            'Izmir': ['Izmir'],
            'Antalya': ['Antalya'],
            'Bursa': ['Bursa'],
            'Gaziantep': ['Gaziantep'],
            'Trabzon': ['Trabzon']
        }
    },
    IT: {
        name: 'İtalya',
        idata: {
            'Istanbul': ['Istanbul (Avrupa)', 'Istanbul (Asya)'],
            'Ankara': ['Ankara'],
            'Izmir': ['Izmir'],
            'Antalya': ['Antalya'],
            'Bursa': ['Bursa'],
            'Gaziantep': ['Gaziantep'],
            'Trabzon': ['Trabzon'],
            'Bodrum': ['Bodrum'],
        }
    },
    ES: {
        name: 'İspanya',
        vfs: {
            'Istanbul': ['Istanbul (Beyoğlu)'],
            'Ankara': ['Ankara'],
            'Izmir': ['Izmir'],
            'Antalya': ['Antalya'],
        }
    },
    FR: {
        name: 'Fransa',
        vfs: {
            'Istanbul': ['Istanbul'],
            'Ankara': ['Ankara'],
            'Izmir': ['Izmir'],
        }
    },
    NL: {
        name: 'Hollanda',
        vfs: {
            'Istanbul': ['Istanbul'],
            'Ankara': ['Ankara'],
            'Izmir': ['Izmir'],
            'Antalya': ['Antalya'],
            'Bursa': ['Bursa'],
            'Gaziantep': ['Gaziantep'],
            'Edirne': ['Edirne'],
            'Bodrum': ['Bodrum'],
            'Trabzon': ['Trabzon'],
        }
    },
    BE: {
        name: 'Belçika',
        vfs: {
            'Istanbul': ['Istanbul'],
            'Ankara': ['Ankara'],
            'Izmir': ['Izmir'],
            'Antalya': ['Antalya'],
        }
    },
    CZ: {
        name: 'Çekya',
        vfs: {
            'Istanbul': ['Istanbul'],
            'Ankara': ['Ankara'],
            'Izmir': ['Izmir'],
            'Antalya': ['Antalya'],
        }
    },
    GR: {
        name: 'Yunanistan',
        cosmos: {
            'Istanbul': ['Istanbul (Harbiye)'],
            'Ankara': ['Ankara'],
            'Izmir': ['Izmir'],
            'Bursa': ['Bursa'],
            'Edirne': ['Edirne'],
            'Bodrum': ['Bodrum'],
        }
    },
    AT: {
        name: 'Avusturya',
        vfs: {
            'Istanbul': ['Istanbul'],
            'Ankara': ['Ankara'],
            'Izmir': ['Izmir'],
        }
    },
    HU: {
        name: 'Macaristan',
        asvize: {
            'Istanbul': ['Istanbul'],
            'Ankara': ['Ankara'],
            'Izmir': ['Izmir'],
            'Bursa': ['Bursa'],
            'Trabzon': ['Trabzon'],
        }
    },
    CH: {
        name: 'İsviçre',
        tlscontact: {
            'Istanbul': ['Istanbul'],
            'Ankara': ['Ankara'],
        }
    },
    PL: {
        name: 'Polonya',
        vfs: {
            'Istanbul': ['Istanbul'],
            'Ankara': ['Ankara'],
            'Izmir': ['Izmir'],
            'Gaziantep': ['Gaziantep'],
        }
    },
    PT: {
        name: 'Portekiz',
        vfs: {
            'Istanbul': ['Istanbul'],
            'Ankara': ['Ankara'],
            'Izmir': ['Izmir'],
            'Antalya': ['Antalya'],
        }
    },
    NO: {
        name: 'Norveç',
        vfs: {
            'Ankara': ['Ankara'],
            'Izmir': ['Izmir'],
        }
    },
    SE: {
        name: 'İsveç',
        vfs: {
            'Istanbul': ['Istanbul'],
            'Ankara': ['Ankara'],
            'Izmir': ['Izmir'],
            'Antalya': ['Antalya'],
        }
    },
    DK: {
        name: 'Danimarka',
        vfs: {
            'Istanbul': ['Istanbul'],
            'Ankara': ['Ankara'],
            'Izmir': ['Izmir'],
        }
    },
    FI: {
        name: 'Finlandiya',
        vfs: {
            'Istanbul': ['Istanbul'],
            'Ankara': ['Ankara'],
        }
    },
    MT: {
        name: 'Malta',
        vfs: {
            'Istanbul': ['Istanbul'],
            'Ankara': ['Ankara'],
            'Izmir': ['Izmir'],
        }
    },
    LT: {
        name: 'Litvanya',
        vfs: {
            'Istanbul': ['Istanbul (Gayrettepe)'],
            'Ankara': ['Ankara'],
        }
    }
};