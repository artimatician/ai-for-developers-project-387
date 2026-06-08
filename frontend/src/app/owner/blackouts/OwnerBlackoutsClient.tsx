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
        <Button leftSection={<IconPlus size={16} />} onClick={open} style={{ backgroundColor: '#111827', color: '#FFFFFF', borderRadius: 8 }}>
          Create Blackout
        </Button>
      </Group>

      {items.length === 0 ? (
        <div style={{ padding: '40px 24px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid #E5E7EB' }}>
          <Text size="sm" c="#6B7280">No blackouts defined. Create a blackout to block time on your calendar.</Text>
        </div>
      ) : (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 10, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ color: '#6B7280', fontWeight: 600, fontSize: 12 }}>Start</Table.Th>
                <Table.Th style={{ color: '#6B7280', fontWeight: 600, fontSize: 12 }}>End</Table.Th>
                <Table.Th style={{ color: '#6B7280', fontWeight: 600, fontSize: 12 }}>Reason</Table.Th>
                <Table.Th style={{ color: '#6B7280', fontWeight: 600, fontSize: 12 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((b) => (
                <Table.Tr key={b.id}>
                  <Table.Td style={{ color: '#6B7280' }}>
                    {dayjs(b.startTime).format('MMM D, YYYY h:mm A')}
                  </Table.Td>
                  <Table.Td style={{ color: '#6B7280' }}>
                    {dayjs(b.endTime).format('MMM D, YYYY h:mm A')}
                  </Table.Td>
                  <Table.Td style={{ color: '#111827' }}>{b.reason || '—'}</Table.Td>
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
        </div>
      )}

      <Modal
        opened={opened}
        onClose={close}
        title="Create Blackout"
        styles={{
          content: { borderRadius: 10 },
          header: { borderBottom: '1px solid #E5E7EB' },
        }}
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
              <Button
                type="submit"
                loading={saving}
                style={{ backgroundColor: '#111827', color: '#FFFFFF', borderRadius: 8 }}
              >
                Create
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
