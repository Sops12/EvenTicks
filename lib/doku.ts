import crypto from 'crypto';

interface DokuConfig {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'production';
}

export class DokuService {
  private config: DokuConfig;
  private baseUrl: string;

  constructor(config: DokuConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'production' 
      ? 'https://api.doku.com'
      : 'https://api-sandbox.doku.com';
  }

  private generateSignature(timestamp: string): string {
    // DOKU requires the string to be signed in this format
    const stringToSign = `${this.config.clientId}|${timestamp}`;
    
    // Create signature using SHA256
    const signature = crypto
      .createHmac('sha256', this.config.clientSecret)
      .update(stringToSign)
      .digest('base64');

    return signature;
  }

  private getFormattedTimestamp(): string {
    // Get current date in UTC
    const now = new Date();
    
    // Ensure we're using the current year
    const currentYear = new Date().getFullYear();
    if (currentYear !== now.getUTCFullYear()) {
      console.warn('System date mismatch detected:', {
        systemYear: currentYear,
        utcYear: now.getUTCFullYear()
      });
    }
    
    // Format the date manually to ensure correct format
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');

    // Format: YYYY-MM-DDTHH:mm:ssZ
    const timestamp = `${currentYear}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
    
    // Log the timestamp for debugging
    console.log('Generated timestamp:', {
      timestamp,
      currentYear,
      utcYear: now.getUTCFullYear(),
      systemDate: new Date().toISOString(),
      utcDate: now.toUTCString()
    });

    return timestamp;
  }

  async getAccessToken(): Promise<{
    accessToken: string;
    tokenType: string;
    expiresIn: number;
  }> {
    const timestamp = this.getFormattedTimestamp();
    const signature = this.generateSignature(timestamp);

    const requestBody = {
      grantType: 'client_credentials'
    };

    const requestHeaders = {
      'Content-Type': 'application/json',
      'X-SIGNATURE': signature,
      'X-TIMESTAMP': timestamp,
      'X-CLIENT-KEY': this.config.clientId,
      'Accept': 'application/json'
    };

    console.log('DOKU Request Details:', {
      url: `${this.baseUrl}/authorization/v1/access-token/b2b`,
      method: 'POST',
      headers: requestHeaders,
      body: requestBody,
      signature: {
        stringToSign: `${this.config.clientId}|${timestamp}`,
        generatedSignature: signature,
        timestamp: timestamp
      }
    });

    try {
      const response = await fetch(`${this.baseUrl}/authorization/v1/access-token/b2b`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(requestBody)
      });

      const responseData = await response.json();
      
      console.log('DOKU Response Details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        requestTimestamp: timestamp
      });

      if (!response.ok) {
        throw new Error(
          `Failed to get access token: ${responseData.responseMessage || responseData.message || JSON.stringify(responseData)} (Status: ${response.status})`
        );
      }

      if (!responseData.accessToken) {
        throw new Error('Invalid response: access token not found in response');
      }

      return {
        accessToken: responseData.accessToken,
        tokenType: responseData.tokenType || 'Bearer',
        expiresIn: responseData.expiresIn || 900
      };
    } catch (error) {
      console.error('DOKU Error Details:', {
        error,
        config: {
          clientId: this.config.clientId,
          environment: this.config.environment,
          baseUrl: this.baseUrl
        },
        timestamp: timestamp
      });
      throw error;
    }
  }
} 