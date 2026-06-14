import { get, post } from '../api/client';
import { API_ROUTES } from '../../constants';
import type { AgentProfile, FarmerProfile } from '../../types';

export interface RegisterFarmerByAgentPayload {
  fullName: string;
  phone: string;
  nin: string;
  district: string;
  village?: string;
  farmSizeAcres: number;
  cropsGrown: string[];
  paymentProvider: 'mtn' | 'airtel';
  paymentNumber: string;
  gpsLat?: number;
  gpsLng?: number;
}

export const agentApi = {
  /** Summary stats for the agent dashboard (farmers registered, earnings) */
  getSummary: () => get<AgentProfile>(API_ROUTES.AGENT_SUMMARY),

  /** List farmers this agent has registered */
  getMyFarmers: () => get<FarmerProfile[]>(API_ROUTES.AGENT_FARMERS),

  /** Register a new farmer on behalf of (in the field with) the farmer */
  registerFarmer: (payload: RegisterFarmerByAgentPayload) =>
    post<{ farmerId: string }>(API_ROUTES.AGENT_FARMER_CREATE, payload),

  /** Earnings / commission history */
  getEarnings: () => get<{ total: number; history: { id: string; amount: number; date: string; farmerName: string }[] }>(
    API_ROUTES.AGENT_EARNINGS,
  ),
};