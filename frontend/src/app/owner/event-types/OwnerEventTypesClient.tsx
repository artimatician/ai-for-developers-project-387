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
    initialValues: { name: '', description: '', timezone: 'UTC' },
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
    form.setValues({ name: et.name, description: et.description, timezone: et.timezone });
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
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
          Create Event Type
        </Button>
      </Group>

      {eventTypes.length === 0 ? (
        <Text c="dimmed">No event types yet.</Text>
      ) : (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Timezone</Table.Th>
              <Table.Th>Active</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {eventTypes.map((et) => (
              <Table.Tr key={et.id}>
                <Table.Td>{et.name}</Table.Td>
                <Table.Td>{et.timezone}</Table.Td>
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
      )}

      <Modal
        opened={opened}
        onClose={close}
        title={editing ? 'Edit Event Type' : 'Create Event Type'}
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
            <Group justify="flex-end">
              <Button variant="default" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Save
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
