import { ORDER_LIST_SELECT } from './orders.repository';

describe('ORDER_LIST_SELECT', () => {
  it('includes event.imageUrl in the event select', () => {
    expect(ORDER_LIST_SELECT.event.select).toHaveProperty('imageUrl', true);
  });

  it('includes event.venue with id, name, city fields', () => {
    expect(ORDER_LIST_SELECT.event.select).toHaveProperty('venue');
    const venueSelect = (ORDER_LIST_SELECT.event.select as Record<string, unknown>).venue as {
      select: Record<string, boolean>;
    };
    expect(venueSelect.select).toMatchObject({ id: true, name: true, city: true });
  });

  it('includes event.format with id and name fields', () => {
    expect(ORDER_LIST_SELECT.event.select).toHaveProperty('format');
    const formatSelect = (ORDER_LIST_SELECT.event.select as Record<string, unknown>).format as {
      select: Record<string, boolean>;
    };
    expect(formatSelect.select).toMatchObject({ id: true, name: true });
  });

  it('preserves existing fields: id, name, eventDate', () => {
    expect(ORDER_LIST_SELECT.event.select).toMatchObject({
      id: true,
      name: true,
      eventDate: true,
    });
  });
});
