'use client';

import { ChatContainer } from '../components/ChatContainer';

const mockThreads = [
  {
    id: '0x1234567890123456789012345678901234567890',
    title: 'Protocol Advocates',
    subtitle: 'Devs · community ops',
    unreadCount: 3,
    lastMessage: 'Shipping v0.3 patch on Base',
    timestamp: '2m ago',
    participants: ['0x1234...', '0x5678...'],
  },
  {
    id: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    title: 'Labs ↔ Core',
    subtitle: 'Product triage',
    lastMessage: 'Drafted Base native invite flow',
    timestamp: '28m ago',
    participants: ['0xabcd...', '0xef01...'],
  },
];

const mockMessages: Record<string, any[]> = {
  '0x1234567890123456789012345678901234567890': [
    {
      id: '1',
      author: 'Avery Chen',
      role: 'Protocol Lead',
      timestamp: Math.floor(Date.now() / 1000) - 300,
      body: 'Shipping v0.3 patch on Base. All tests passing.',
      isSelf: false,
      status: 'read',
    },
    {
      id: '2',
      author: 'You',
      timestamp: Math.floor(Date.now() / 1000) - 120,
      body: 'Great work! Ready to deploy?',
      isSelf: true,
      status: 'read',
    },
  ],
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd': [
    {
      id: '3',
      author: 'Miles',
      role: 'PM',
      timestamp: Math.floor(Date.now() / 1000) - 1800,
      body: 'Drafted Base native invite flow. Need async approvals.',
      isSelf: false,
      status: 'delivered',
    },
  ],
};

export default function Home() {
  return (
    <ChatContainer initialThreads={mockThreads} initialMessages={mockMessages} />
  );
}
