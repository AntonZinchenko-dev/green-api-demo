import { afterEach, describe, expect, it, vi } from 'vitest';
import { GreenApiClient, resolveApiUrl } from './client';
import { GreenApiError } from './errors';

const credentials = { idInstance: '3100000001', apiTokenInstance: 'token123' };

interface FetchStub {
  ok?: boolean;
  status?: number;
  /** Текст ответа, как его вернёт `response.text()`. */
  text?: string;
}

function mockFetch(response: FetchStub) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok ?? true,
    status: response.status ?? 200,
    text: async () => response.text ?? '',
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('resolveApiUrl', () => {
  it('вычисляет хост из первых четырёх цифр idInstance', () => {
    expect(resolveApiUrl('3100000001')).toBe('https://3100.api.green-api.com');
  });

  it('уважает явно заданный хост', () => {
    expect(resolveApiUrl('3100000001', 'https://api.green-api.com/')).toBe(
      'https://api.green-api.com',
    );
  });
});

describe('GreenApiClient', () => {
  it('строит адрес sendMessage по схеме GREEN-API', async () => {
    const fetchMock = mockFetch({ text: '{"idMessage":"123"}' });
    const client = new GreenApiClient(credentials);

    const result = await client.sendMessage({ chatId: '10000000', message: 'Привет!' });

    expect(result).toEqual({ idMessage: '123' });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://3100.api.green-api.com/waInstance3100000001/sendMessage/token123',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ chatId: '10000000', message: 'Привет!' }),
      }),
    );
  });

  it('передаёт receiveTimeout в строке запроса', async () => {
    const fetchMock = mockFetch({ text: '' });
    const client = new GreenApiClient(credentials);

    const result = await client.receiveNotification(10);

    expect(result).toBeNull();
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://3100.api.green-api.com/waInstance3100000001/receiveNotification/token123?receiveTimeout=10',
    );
  });

  it('ставит receiptId после токена в deleteNotification', async () => {
    const fetchMock = mockFetch({ text: '{"result":true}' });
    const client = new GreenApiClient(credentials);

    await client.deleteNotification(1234567);

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://3100.api.green-api.com/waInstance3100000001/deleteNotification/token123/1234567',
    );
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'DELETE' });
  });

  it('превращает HTTP-ошибку в GreenApiError с понятным текстом', async () => {
    mockFetch({ ok: false, status: 401, text: '{"message":"Unauthorized"}' });
    const client = new GreenApiClient(credentials);

    await expect(client.getStateInstance()).rejects.toBeInstanceOf(GreenApiError);

    try {
      await client.getStateInstance();
    } catch (error) {
      expect((error as GreenApiError).userMessage).toMatch(/idInstance/);
    }
  });
});
