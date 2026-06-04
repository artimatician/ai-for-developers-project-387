'use client';

import { useState } from 'react';
import {
  Table,
  Button,
  Group,
  Stack,
  Modal,
  TextInput,
  ActionIcon,
  Text,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { createBlackout, deleteBlackout } from '@/lib/api';
import type { components } from '@/lib/api-types';

dayjs.extend(utc);

type Blackout = components['schemas']['Blackout'];

interface OwnerBlackoutsClientProps {
  blackouts: Blackout[];
}

export function OwnerBlackoutsClient({ blackouts: initial }: OwnerBlackoutsClientProps) {
  const [items, setItems] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();

  const form = useForm({
    initialValues: {
      startTime: null as Date | null,
      endTime: null as Date | null,
      reason: '',
    },
    validate: {
      startTime: (v) => (v ? null : 'Start time is required'),
      endTime: (v) => (v ? null : 'End time is required'),
    },
  });

  const handleCreate = async (values: typeof form.values) => {
    if (!values.startTime || !values.endTime) return;
    setSaving(true);
    try {
      const created = await createBlackout({
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
        reason: values.reason || undefined,
      });
      setItems((prev) => [...prev, created]);
      notifications.show({ message: 'Blackout created', color: 'green' });
      close();
      form.reset();
      router.refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create';
      notifications.show({ message: msg, color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBlackout(id);
      setItems((prev) => prev.filter((b) => b.id !== id));
      notifications.show({ message: 'Blackout deleted', color: 'green' });
      router.refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to delete';
      notifications.show({ message: msg, color: 'red' });
    }
  };

  return (
    <>
      <Group justify="flex-end" mb="md">
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          Create Blackout
        </Button>
      </Group>

      {items.length === 0 ? (
        <Text c="dimmed">No blackouts defined.</Text>
      ) : (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Start</Table.Th>
              <Table.Th>End</Table.Th>
              <Table.Th>Reason</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.map((b) => (
              <Table.Tr key={b.id}>
                <Table.Td>
                  {dayjs(b.startTime).format('MMM D, YYYY h:mm A')}
                </Table.Td>
                <Table.Td>
                  {dayjs(b.endTime).format('MMM D, YYYY h:mm A')}
                </Table.Td>
                <Table.Td>{b.reason || '—'}</Table.Td>
                <Table.Td>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleDelete(b.id)}
                  >
                    <IconTrash size={18} />
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
        title="Create Blackout"
      >
        <form onSubmit={form.onSubmit(handleCreate)}>
          <Stack>
            <DateTimePicker
              label="Start Time"
              required
              {...form.getInputProps('startTime')}
            />
            <DateTimePicker
              label="End Time"
              required
              {...form.getInputProps('endTime')}
            />
            <TextInput
              label="Reason (optional)"
              {...form.getInputProps('reason')}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Create
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
