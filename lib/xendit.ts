import axios from 'axios';

interface XenditConfig {
  secretKey: string;
}

interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
}

interface PaymentResponse {
  paymentUrl: string;
  expiryDate: string;
}

export class XenditService {
  private baseUrl: string;
  private authToken: string;

  constructor(config: XenditConfig) {
    this.baseUrl = 'https://api.xendit.co/v2';
    this.authToken = Buffer.from(`${config.secretKey}:`).toString('base64');
  }

  private formatPrice(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  async createPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/invoices`,
        {
          external_id: request.orderId,
          amount: request.amount,
          description: `Payment for order ${request.orderId}`,
          invoice_duration: 86400, // 24 hours in seconds
          customer: {
            given_names: request.customer.name,
            email: request.customer.email,
            mobile_number: request.customer.phone,
          },
          items: [
            {
              name: 'Event Ticket',
              quantity: 1,
              price: request.amount,
              category: 'Event',
            },
          ],
          fees: [
            {
              type: 'Event Ticket',
              value: request.amount,
            },
          ],
          success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
          failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failed`,
        },
        {
          headers: {
            'Authorization': `Basic ${this.authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        paymentUrl: response.data.invoice_url,
        expiryDate: response.data.expiry_date,
      };
    } catch (error: any) {
      console.error('Xendit Error:', error.response?.data || error.message);
      throw new Error(`Failed to create payment: ${error.response?.data?.message || error.message}`);
    }
  }

  async getPaymentStatus(invoiceId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/invoices/${invoiceId}`,
        {
          headers: {
            'Authorization': `Basic ${this.authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        status: response.data.status,
        paidAmount: response.data.paid_amount,
        paidAt: response.data.paid_at,
      };
    } catch (error: any) {
      console.error('Xendit Error:', error.response?.data || error.message);
      throw new Error(`Failed to get payment status: ${error.response?.data?.message || error.message}`);
    }
  }
}
