/**
 * Типы запросов и уведомлений GREEN-API (интеграция с мессенджером MAX).
 * @see https://green-api.com/v3/docs/api/
 */

export interface GreenApiCredentials {
  idInstance: string;
  apiTokenInstance: string;
  /** Хост API. По умолчанию вычисляется из idInstance. */
  apiUrl?: string;
}

/* ─────────────────────────── Аккаунт ─────────────────────────── */

export type InstanceState =
  | 'notAuthorized'
  | 'authorized'
  | 'blocked'
  | 'sleepMode'
  | 'starting'
  | 'yellowCard';

export interface GetStateInstanceResponse {
  stateInstance: InstanceState;
}

/* ─────────────────────────── Отправка ─────────────────────────── */

export interface SendMessageRequest {
  chatId: string;
  message: string;
  quotedMessageId?: string;
  linkPreview?: boolean;
}

export interface SendMessageResponse {
  idMessage: string;
}

/* ───────────────────── Сервисные методы ──────────────────────── */

export interface CheckAccountRequest {
  phoneNumber: number;
  force?: boolean;
}

export interface CheckAccountResponse {
  exist: boolean;
  chatId: string;
  fromCache?: boolean;
  /** Приходит вместо основного тела, если инстанс не авторизован. */
  status?: false;
  reason?: string;
}

/* ─────────────────── Входящие уведомления ────────────────────── */

export type WebhookType =
  | 'incomingMessageReceived'
  | 'outgoingMessageReceived'
  | 'outgoingAPIMessageReceived'
  | 'outgoingMessageStatus'
  | 'stateInstanceChanged'
  | 'deviceInfo'
  | 'incomingCall'
  | 'quotaExceeded';

export type OutgoingMessageStatus =
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'noAccount'
  | 'notInGroup';

export interface InstanceData {
  idInstance: number;
  wid: string;
  typeInstance: string;
}

export interface SenderData {
  chatId: string;
  chatName?: string;
  chatType?: string;
  sender?: string;
  senderName?: string;
  senderType?: string;
  senderContactName?: string;
  senderPhoneNumber?: number | string;
}

export interface TextMessageData {
  textMessage: string;
}

export interface ExtendedTextMessageData {
  text: string;
  description?: string;
  title?: string;
  previewType?: string;
  jpegThumbnail?: string;
  forwardingScore?: number;
  isForwarded?: boolean;
}

export interface MessageData {
  typeMessage: string;
  textMessageData?: TextMessageData;
  extendedTextMessageData?: ExtendedTextMessageData;
}

export interface MessageWebhook {
  typeWebhook:
    | 'incomingMessageReceived'
    | 'outgoingMessageReceived'
    | 'outgoingAPIMessageReceived';
  instanceData: InstanceData;
  timestamp: number;
  idMessage: string;
  senderData: SenderData;
  messageData: MessageData;
}

export interface StatusWebhook {
  typeWebhook: 'outgoingMessageStatus';
  instanceData?: InstanceData;
  timestamp: number;
  chatId: string;
  idMessage: string;
  status: OutgoingMessageStatus;
  description?: string;
  sendByApi?: boolean;
}

export interface StateInstanceWebhook {
  typeWebhook: 'stateInstanceChanged';
  instanceData?: InstanceData;
  timestamp: number;
  stateInstance: InstanceState;
}

export interface UnknownWebhook {
  typeWebhook: Exclude<
    WebhookType,
    | 'incomingMessageReceived'
    | 'outgoingMessageReceived'
    | 'outgoingAPIMessageReceived'
    | 'outgoingMessageStatus'
    | 'stateInstanceChanged'
  >;
  timestamp?: number;
  [key: string]: unknown;
}

export type Notification =
  | MessageWebhook
  | StatusWebhook
  | StateInstanceWebhook
  | UnknownWebhook;

export interface ReceiveNotificationResponse {
  receiptId: number;
  body: Notification;
}

export interface DeleteNotificationResponse {
  result: boolean;
}
