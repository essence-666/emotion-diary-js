require('dotenv').config({ path: '../../.env' });
const { Agent } = require('node:https');
const { GigaChat } = require('langchain-gigachat');
const { createReactAgent } = require('@langchain/langgraph/prebuilt');
const { HumanMessage } = require('@langchain/core/messages');
const { MemorySaver } = require('@langchain/langgraph');
const { v4: uuid } = require('uuid');

// Игнорируем проверку self-signed сертификата
const httpsAgent = new Agent({ rejectUnauthorized: false });

// Создаём LLM
const llm = new GigaChat({
  credentials: process.env.GIGA_AUTH,
  model: 'GigaChat-2',
  httpsAgent
});

// Создаём агента
const agent = createReactAgent({
  llm,
  tools: [], // можно добавить свои инструменты
  prompt: `Ты помогаешь пользователю с эмоциональными инсайтами и персональными промптами.`,
  checkpointer: new MemorySaver()
});

// Функция вызова агента
const callAgent = async (messages, sessionId = uuid()) => {
  const response = await agent.invoke(
    { messages: messages.map(msg => new HumanMessage(msg.content || msg)) },
    { configurable: { thread_id: sessionId } }
  );
  return response;
};

module.exports = { agent, callAgent };
