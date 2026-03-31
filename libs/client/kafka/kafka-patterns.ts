export const AUTH_COMMANDS = 'auth.commands' as const;
export const AUTH_ACTION_REGISTER = 'register' as const;
export const AUTH_ACTION_LOGIN = 'login' as const;
export const AUTH_ACTION_VALIDATE_TOKEN = 'validate_token' as const;

export const BANKING_HEALTH = 'health' as const;
export const BANKING_COMMANDS = 'banking.commands' as const;
export const BANKING_EVENTS = 'banking.events' as const;
export const BANKING_ACTION_ACCOUNTS_LIST = 'accounts.list' as const;
export const BANKING_ACTION_OPERATIONS_LIST = 'operations.list' as const;
export const BANKING_ACTION_FINANCIAL_OPERATIONS_CREATE =
  'financial_operations.create' as const;
export const BANKING_ACTION_FINANCIAL_OPERATION_CREATED_EVENT =
  'financial_operation.created' as const;
