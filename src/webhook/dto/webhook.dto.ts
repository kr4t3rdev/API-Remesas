export interface TransactionWebhookPayload {
  transactionId: number;
  previousStatus: 'PENDIENTE' | 'RECONCILIADO';
  newStatus: 'RECONCILIADO';
  userId: number;
  amount: string;
  currency: string;
  totalCup: string;
  reconciledAt: string;
  bankAccountId: number;
}
