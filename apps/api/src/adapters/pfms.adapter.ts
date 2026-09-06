/**
 * Public Financial Management System (PFMS) - Direct Benefit Transfer (DBT) Mock Adapter
 * Simulates integration with the Ministry of Finance / PFMS Gateway.
 */

export interface PFMSPaymentRequest {
  awardId: string;
  beneficiaryName: string;
  bankAccountMasked?: string | null;
  ifscCode?: string | null;
  amount: number;
}

export interface PFMSPaymentResponse {
  success: boolean;
  utrReference: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED' | 'PROCESSING';
  bankAckNumber: string;
  message: string;
}

export class PFMSAdapter {
  /**
   * Dispatches direct compensation transfer to the beneficiary account
   */
  static async processDirectBenefitTransfer(
    payload: PFMSPaymentRequest
  ): Promise<PFMSPaymentResponse> {
    // Generate authentic Indian Bank UTR format: UTR-{YEAR}-{RANDOM10}
    const year = new Date().getFullYear();
    const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase();
    const utrReference = `PFMS${year}${randomHex}${Math.floor(1000 + Math.random() * 9000)}`;
    const bankAckNumber = `ACK-RBI-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // In a production system, this makes an mTLS SOAP/REST call to PFMS Gateway
    return {
      success: true,
      utrReference,
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
      bankAckNumber,
      message: `Direct Benefit Transfer of INR ${payload.amount.toLocaleString('en-IN')} successfully credited to beneficiary ${payload.beneficiaryName} via RBI-NEFT/RTGS gateway.`,
    };
  }
}
