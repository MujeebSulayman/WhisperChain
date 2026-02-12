'use client';

import { Suspense } from 'react';
import { ChatContainer } from '../components/ChatContainer';

export default function Home() {
  return (
    <Suspense fallback={null}>
      <ChatContainer />
    </Suspense>
  );
}
