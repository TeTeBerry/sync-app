import { apiGet } from '../../utils/apiClient';

/** STS credentials from `GET /cos/sts-key` (JWT required). */
export type CosStsKey = {
  TmpSecretId: string;
  TmpSecretKey: string;
  SessionToken: string;
  ExpiredTime: number;
};

export function fetchCosStsKey() {
  return apiGet<CosStsKey>('/cos/sts-key');
}
