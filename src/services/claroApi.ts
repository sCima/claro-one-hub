import {
  mockUser, mockServices, mockInvoices, mockDataHistory,
  mockSupportChannels, mockClube, mockActivity, mockNotifications, mockRecommendations,
} from '../data/mockData';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const claroApi = {
  async getUser()             { await delay(700);  return mockUser;            },
  async getServices()         { await delay(900);  return mockServices;        },
  async getInvoices()         { await delay(800);  return mockInvoices;        },
  async getDataHistory()      { await delay(500);  return mockDataHistory;     },
  async getSupportChannels()  { await delay(300);  return mockSupportChannels; },
  async getClube()            { await delay(600);  return mockClube;           },
  async getActivity()         { await delay(700);  return mockActivity;        },
  async getNotifications()    { await delay(400);  return mockNotifications;   },
  async getRecommendations()  { await delay(500);  return mockRecommendations; },
};
