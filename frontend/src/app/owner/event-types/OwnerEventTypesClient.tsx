'use client';

import { useState } from 'react';
import {
  Table,
  Switch,
  Button,
  Group,
  Stack,
  Modal,
  TextInput,
  NumberInput,
  Select,
  ActionIcon,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconPlus } from '@tabler/icons-react';
import { updateEventType, createEventType } from '@/lib/api';
import type { components } from '@/lib/api-types';

type EventType = components['schemas']['EventType'];

const timezones = Intl.supportedValuesOf?.('timeZone') || [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Europe/Moscow',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Australia/Sydney',
];

interface OwnerEventTypesClientProps {
  eventTypes: EventType[];
}

export function OwnerEventTypesClient({ eventTypes: initial }: OwnerEventTypesClientProps) {
  const [eventTypes, setEventTypes] = useState(initial);
  const [editing, setEditing] = useState<EventType | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();

  const form = useForm({
    initialValues: { name: '', description: '', timezone: 'UTC', duration: 30 },
    validate: {
      name: (v) => (v.trim().length > 0 ? null : 'Name is required'),
      description: (v) => (v.length <= 1000 ? null : 'Max 1000 characters'),
    },
  });

  const openCreate = () => {
    form.reset();
    setEditing(null);
    setCreating(true);
    open();
  };

  const openEdit = (et: EventType) => {
    form.setValues({ name: et.name, description: et.description, timezone: et.timezone, duration: et.duration ?? 30 });
    setEditing(et);
    setCreating(false);
    open();
  };

  const handleSave = async (values: typeof form.values) => {
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateEventType(editing.id, values);
        setEventTypes((prev) => prev.map((et) => (et.id === editing.id ? updated : et)));
        notifications.show({ message: 'Event type updated', color: 'green' });
      } else {
        const created = await createEventType(values);
        setEventTypes((prev) => [...prev, created]);
        notifications.show({ message: 'Event type created', color: 'green' });
      }
      close();
      router.refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save';
      notifications.show({ message: msg, color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (et: EventType) => {
    try {
      const updated = await updateEventType(et.id, { isActive: !et.isActive });
      setEventTypes((prev) => prev.map((e) => (e.id === et.id ? updated : e)));
      router.refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to toggle';
      notifications.show({ message: msg, color: 'red' });
    }
  };

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate} style={{ backgroundColor: '#111827', color: '#FFFFFF', borderRadius: 8 }}>
          Create Event Type
        </Button>
      </Group>

      {eventTypes.length === 0 ? (
        <div style={{ padding: '40px 24px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid #E5E7EB' }}>
          <Text size="sm" c="#6B7280">No event types yet. Create one to start accepting bookings.</Text>
        </div>
      ) : (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ color: '#6B7280', fontWeight: 600, fontSize: 12 }}>Name</Table.Th>
                <Table.Th style={{ color: '#6B7280', fontWeight: 600, fontSize: 12 }}>Duration</Table.Th>
                <Table.Th style={{ color: '#6B7280', fontWeight: 600, fontSize: 12 }}>Timezone</Table.Th>
                <Table.Th style={{ color: '#6B7280', fontWeight: 600, fontSize: 12 }}>Active</Table.Th>
                <Table.Th style={{ color: '#6B7280', fontWeight: 600, fontSize: 12 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {eventTypes.map((et) => (
                <Table.Tr key={et.id}>
                  <Table.Td style={{ color: '#111827', fontWeight: 500 }}>{et.name}</Table.Td>
                  <Table.Td style={{ color: '#6B7280' }}>{et.duration ?? 30} min</Table.Td>
                  <Table.Td style={{ color: '#6B7280' }}>{et.timezone}</Table.Td>
                  <Table.Td>
                    <Switch
                      checked={et.isActive}
                      onChange={() => handleToggleActive(et)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon variant="subtle" onClick={() => openEdit(et)}>
                      <IconEdit size={18} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      )}

      <Modal
        opened={opened}
        onClose={close}
        title={editing ? 'Edit Event Type' : 'Create Event Type'}
        styles={{
          content: { borderRadius: 10 },
          header: { borderBottom: '1px solid #E5E7EB' },
        }}
      >
        <form onSubmit={form.onSubmit(handleSave)}>
          <Stack>
            <TextInput
              label="Name"
              required
              {...form.getInputProps('name')}
            />
            <TextInput
              label="Description"
              {...form.getInputProps('description')}
            />
            <Select
              label="Timezone"
              data={timezones}
              searchable
              {...form.getInputProps('timezone')}
            />
            <NumberInput
              label="Maximum duration (minutes)"
              description="Maximum booking duration (15–480 min, 15-min increments)"
              min={15}
              max={480}
              step={15}
              clampBehavior="strict"
              {...form.getInputProps('duration')}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={close}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={saving}
                style={{ backgroundColor: '#111827', color: '#FFFFFF', borderRadius: 8 }}
              >
                Save
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
