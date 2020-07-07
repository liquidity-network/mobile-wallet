export enum ErrorMessages {
  SEND_RECIPIENT_NOT_REGISTERED = 100,
}

const errorMessages = {
  [ErrorMessages.SEND_RECIPIENT_NOT_REGISTERED]:
    'Recipient address is not registered, please check correctness.',
}

export const getErrorMessage = (errorCode: number): string =>
  errorMessages[errorCode] || 'Unknown error'
