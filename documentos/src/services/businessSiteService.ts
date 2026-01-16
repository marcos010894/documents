import { AxiosInstance } from 'axios';

export interface BusinessSiteData {
  type_user: string;
  id_busness: number;
  dados_site: Record<string, any>;
  id?: number;
  updated_at?: string;
}

export interface UpdateBusinessSiteData {
  dados_site: Record<string, any>;
}

export const businessSiteService = {
  // Get all business sites
  getAllBusinessSites: async (apiInstance: AxiosInstance): Promise<BusinessSiteData[]> => {
    const response = await apiInstance.get('/v1/busnessSite/');
    return response.data;
  },

  // Get a specific business site
  getBusinessSite: async (apiInstance: AxiosInstance, businessId: number, typeUser: string): Promise<BusinessSiteData> => {
    const timestamp = new Date().getTime();
    const response = await apiInstance.get(`/v1/busnessSite/${businessId}/${typeUser}?_t=${timestamp}`);
    return response.data;
  },

  // Create a new business site
  createBusinessSite: async (apiInstance: AxiosInstance, data: Omit<BusinessSiteData, 'id' | 'updated_at'>): Promise<BusinessSiteData> => {
    const response = await apiInstance.post('/v1/busnessSite/', data);
    return response.data;
  },

  // Update an existing business site
  updateBusinessSite: async (
    apiInstance: AxiosInstance,
    businessId: number,
    typeUser: string,
    data: UpdateBusinessSiteData
  ): Promise<BusinessSiteData> => {
    const response = await apiInstance.patch(`/v1/busnessSite/${businessId}/${typeUser}`, data);
    return response.data;
  }
}; 