// Platform configuration constants
// These would normally come from environment variables
export const CONFIG = {
  PLATFORM_NAME: "Comet",
  API_BASE_URL: "https://infra.comet.com.br/admins/",
  PRIMARY_COLOR: "#2878f0",
  DARK_MODE_PRIMARY_COLOR: "#2878f0",
} as const;

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: "login",
  HOME: "revenue/daily",
  PROFIT: "profit/daily",
  SELLER_RANK: "top-sellers",
  SIGNUPS: "signups",
  USERS: "users",
  TRANSFER_REQUESTS: "transfers-requests",
  APPROVE_TRANSFER: "approve-transfer-request",
  REFUSE_TRANSFER: "refuse-transfer-request",
  STANDBY_TRANSFER: "standby-transfer-request",
  VERIFY_STREAMER: "verify-streamer-withdraw",
  BLOCK_STREAMER: "block-streamer",
  UNBLOCK_STREAMER: "unblock-streamer",
  PAYOUTS: "payouts",
  AVAILABLE_AMOUNT: "available-amount",
  MAKE_PAYOUTS: "make-payouts",
  STREAMERS: "streamers",
  MEDS: "meds",
} as const;

// Gateway types enum
export const GATEWAY_TYPES = [
  "Pagarme",
  "Pagbank", 
  "PagarmePocket",
  "Efi",
  "Delbank",
  "Stripe",
  "BrasilBitcoin",
  "PicPay",
  "Comet",
  "InfoPago",
] as const;

// Fee duration enum
export const FEE_DURATION = [
  { label: "1 mês", value: 0 },
  { label: "6 meses", value: 1 },
  { label: "1 ano", value: 2 },
  { label: "2 anos", value: 3 },
] as const;

// Days enum for filtering
export const DAYS_OPTIONS = [
  { label: "Hoje", value: 0 },
  { label: "Ontem e hoje", value: 1 },
  { label: "Última semana", value: 7 },
  { label: "Última quinzena", value: 15 },
  { label: "Último mês", value: 30 },
  { label: "Últimos 3 meses", value: 90 },
] as const;

// Transaction status enum
export const TRANSACTION_STATUS: { [key: number]: string } = {
  0: "Criada",
  1: "Processando", 
  2: "Autorizada",
  3: "Aprovada",
  4: "Reembolsada",
  5: "Aguardando pagamento",
  6: "Aguardando estorno",
  7: "Cancelada",
  8: "Chargeback",
  9: "Analisando",
  10: "Pendente de Revisão"
};

// Withdraw status enum (corrected)
export const WITHDRAW_STATUS: { [key: number]: string } = {
  0: "Pendente",
  1: "Transferido",
  2: "Falhou",
  3: "Processando", 
  4: "Cancelado",
  5: "Parcialmente Transferido",
  6: "Aguardando"
};

// Analysis result enum
export const ANALYSIS_RESULT: Record<number, string> = {
  0: "Pendente de Análise",
  1: "Aprovado",
  2: "Recusado",
  3: "Recusado por Fraude",
  4: "Automático",
  5: "Na Fila",
  6: "Em Espera"
};

// Analysis result filter options
export const ANALYSIS_RESULT_OPTIONS = [
  { label: "Aprovado", value: 1 },
  { label: "Recusado", value: 2 },
  { label: "Recusado por Fraude", value: 3 },
  { label: "Automático", value: 4 },
  { label: "Na Fila", value: 5 },
  { label: "Em Espera", value: 6 },
] as const;

export const DATE_RANGE: Record<number, string> = {
  0: "Hoje",
  1: "Últimos 7 Dias",
  2: "Últimos 30 Dias"
};

// Fee duration labels
export const FEE_DURATION_LABELS: Record<number, string> = {
  0: "1 Mês",
  1: "6 Meses",
  2: "1 Ano",
  3: "2 Anos"
};

// Search types for sellers
export const SELLER_SEARCH_TYPES = [
  { label: "E-mail do vendedor", value: 2 },
  { label: "Documento do vendedor", value: 3 },
  { label: "End2End", value: 4 },
] as const;

// Search types for transactions
export const TRANSACTION_SEARCH_TYPES = [
  { label: "ID do Gateway", value: 0 },
  { label: "E-mail do comprador", value: 1 },
  { label: "E-mail do vendedor", value: 2 },
  { label: "Documento do vendedor", value: 3 },
  { label: "End2End", value: 4 },
] as const;
