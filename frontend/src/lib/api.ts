import { ApiError } from './api-error';
import type { components, operations } from './api-types';

type EventType = components['schemas']['EventType'];
type PublicEventType = components['schemas']['PublicEventType'];
type TimeSlot = components['schemas']['TimeSlot'];
type GuestBookingResponse = components['schemas']['GuestBookingResponse'];
type Blackout = components['schemas']['Blackout'];
type Booking = components['schemas']['Booking'];

function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.API_URL || 'http://localhost:4010';
  }
  return process.env.NEXT_PUBLIC_API_URL || window.location.origin;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const url = new URL(path, getBaseUrl());
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const res = await fetch(url.toString(), {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let code = 'UNKNOWN_ERROR';
    let message = 'An unexpected error occurred';
    try {
      const err = await res.json();
      code = err.code || code;
      message = err.message || message;
    } catch {}
    throw new ApiError(code, message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export async function listActiveEventTypes(): Promise<PublicEventType[]> {
  return request<PublicEventType[]>('GET', '/api/event-types');
}

export async function getActiveEventType(id: string): Promise<EventType> {
  return request<EventType>('GET', `/api/event-types/${id}`);
}

export async function getSlots(id: string, duration?: number): Promise<TimeSlot[]> {
  return request<TimeSlot[]>('GET', `/api/event-types/${id}/slots`, undefined, { duration });
}

export async function createBooking(
  data: components['schemas']['CreateBookingRequest'],
): Promise<GuestBookingResponse> {
  return request<GuestBookingResponse>('POST', '/api/bookings', data);
}

export async function listEventTypes(): Promise<EventType[]> {
  return request<EventType[]>('GET', '/api/owner/event-types');
}

export async function createEventType(
  data: components['schemas']['CreateEventTypeRequest'],
): Promise<EventType> {
  return request<EventType>('POST', '/api/owner/event-types', data);
}

export async function getEventType(id: string): Promise<EventType> {
  return request<EventType>('GET', `/api/owner/event-types/${id}`);
}

export async function updateEventType(
  id: string,
  data: components['schemas']['UpdateEventTypeRequest'],
): Promise<EventType> {
  return request<EventType>('PATCH', `/api/owner/event-types/${id}`, data);
}

export async function listBookings(params?: {
  eventTypeId?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}): Promise<Booking[]> {
  return request<Booking[]>('GET', '/api/owner/bookings', undefined, params as Record<string, string | number | undefined>);
}

export async function listBlackouts(): Promise<Blackout[]> {
  return request<Blackout[]>('GET', '/api/owner/blackouts');
}

export async function createBlackout(
  data: components['schemas']['CreateBlackoutRequest'],
): Promise<Blackout> {
  return request<Blackout>('POST', '/api/owner/blackouts', data);
}

export async function deleteBlackout(id: string): Promise<void> {
  return request<void>('DELETE', `/api/owner/blackouts/${id}`);
}
