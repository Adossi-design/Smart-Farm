import { buildApiUrl } from './api';

/**
 * Stream a chat turn from the Toumaï AI assistant.
 *
 * @param {Object}   opts
 * @param {Array}    opts.messages  Conversation history: [{ role, content }]
 * @param {string}   [opts.userName] Optional display name for personalization
 * @param {string}   [opts.locale]   Optional UI language code (en/fr/ar)
 * @param {AbortSignal} [opts.signal]
 * @param {Function} [opts.onDelta]  Called with each text chunk
 * @param {Function} [opts.onTool]   Called with the tool name when the assistant searches the catalog
 * @returns {Promise<string>} the full assistant reply text
 */
export const streamAssistant = async ({ messages, userName, locale, signal, onDelta, onTool }) => {
  const response = await fetch(buildApiUrl('/api/assistant/chat'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, userName, locale }),
    signal
  });

  if (!response.ok) {
    let message = 'The assistant is unavailable right now.';
    try {
      const data = await response.json();
      if (data?.message) message = data.message;
    } catch {
      // non-JSON error body — keep the default message
    }
    throw new Error(message);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  // Parse the Server-Sent Events stream incrementally.
  // Events are separated by a blank line; each has "event:" and "data:" lines.
  const handleEvent = (rawEvent) => {
    let eventType = 'message';
    const dataLines = [];
    for (const line of rawEvent.split('\n')) {
      if (line.startsWith('event:')) eventType = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
    }
    if (dataLines.length === 0) return;
    let payload;
    try {
      payload = JSON.parse(dataLines.join('\n'));
    } catch {
      return;
    }
    if (eventType === 'delta' && payload.text) {
      full += payload.text;
      onDelta?.(payload.text);
    } else if (eventType === 'tool') {
      onTool?.(payload.name);
    } else if (eventType === 'error') {
      throw new Error(payload.message || 'Assistant error.');
    }
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sepIndex;
    while ((sepIndex = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, sepIndex);
      buffer = buffer.slice(sepIndex + 2);
      if (rawEvent.trim()) handleEvent(rawEvent);
    }
  }

  return full;
};
