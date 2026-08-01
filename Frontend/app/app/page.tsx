'use client';

import { Suspense } from 'react';
import { ChatContainer } from '../../components/ChatContainer';

export default function AppHome() {
  return (
    <Suspense fallback={null}>
      <ChatContainer />
    </Suspense>
  );
}
