import { DokuService } from './doku';

// Initialize DOKU service with environment variables
export const dokuClient = new DokuService({
  clientId: process.env.NEXT_PUBLIC_DOKU_CLIENT_ID!,
  clientSecret: process.env.NEXT_PUBLIC_DOKU_CLIENT_SECRET!,
  environment: (process.env.NEXT_PUBLIC_DOKU_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
});