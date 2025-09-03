'use client';

import { useSuiClientQuery } from '@mysten/dapp-kit';
import type { Event } from './types';

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID;

export function useEvents() {
  // イベント作成イベントからIDを取得
  const { data: eventCreatedEvents } = useSuiClientQuery(
    'queryEvents',
    {
      query: {
        MoveEventType: `${PACKAGE_ID}::core::EventCreated`,
      },
      limit: 50,
      order: 'descending',
    },
    {
      enabled: !!PACKAGE_ID,
    }
  );

  // イベントIDのリストを作成（重複を除去）
  const allEventIds = [...new Set(
    (eventCreatedEvents?.data || []).map((event) => {
      const eventData = event.parsedJson as { event_id?: string };
      return eventData?.event_id;
    }).filter(Boolean)
  )];

  // 各イベントIDからオブジェクトデータを取得
  const { data: eventObjects, isLoading, error, refetch } = useSuiClientQuery(
    'multiGetObjects',
    {
      ids: allEventIds,
      options: {
        showContent: true,
      },
    },
    {
      enabled: allEventIds.length > 0,
    }
  );

  const events: Event[] = (eventObjects || []).map((obj) => {
    const content = obj.data?.content;
    if (content?.dataType === 'moveObject' && content.fields) {
      const fields = content.fields as {
        name?: string;
        slug?: string;
        description?: string;
        image_url?: string;
        start_ms?: string;
        end_ms?: string;
        cap?: string;
        minted?: string;
        admin?: string;
      };
      return {
        id: obj.data?.objectId || '',
        name: fields.name || '',
        slug: fields.slug || '',
        description: fields.description || '',
        imageUrl: fields.image_url || '',
        startMs: parseInt(fields.start_ms || '0'),
        endMs: parseInt(fields.end_ms || '0'),
        cap: parseInt(fields.cap || '0'),
        minted: parseInt(fields.minted || '0'),
        admin: fields.admin || '',
      };
    }
    return null;
  }).filter((event): event is Event => event !== null);

  return {
    events,
    isLoading,
    error,
    refetch,
  };
}