import { generateFavoriteAlertEmail } from './favorite-alert.template';

describe('generateFavoriteAlertEmail', () => {
  const baseParams = {
    userName: 'Alice',
    eventName: 'Rock Festival 2026',
    alertType: 'SELLING_OUT' as const,
    eventUrl: 'https://veritix.com/events/rock-festival-2026',
  };

  describe('SELLING_OUT alert', () => {
    it('includes the event name in the HTML output', () => {
      const html = generateFavoriteAlertEmail(baseParams);
      expect(html).toContain('Rock Festival 2026');
    });

    it('includes the user name in the HTML output', () => {
      const html = generateFavoriteAlertEmail(baseParams);
      expect(html).toContain('Alice');
    });

    it('includes a selling-out message', () => {
      const html = generateFavoriteAlertEmail(baseParams);
      expect(html.toLowerCase()).toMatch(/selling out|few tickets|casi agotad|pocas entradas/);
    });

    it('includes the event URL as a link', () => {
      const html = generateFavoriteAlertEmail(baseParams);
      expect(html).toContain('https://veritix.com/events/rock-festival-2026');
    });
  });

  describe('NEW_TICKET_TYPE alert', () => {
    const newTypeParams = {
      ...baseParams,
      alertType: 'NEW_TICKET_TYPE' as const,
    };

    it('includes the event name in the HTML output', () => {
      const html = generateFavoriteAlertEmail(newTypeParams);
      expect(html).toContain('Rock Festival 2026');
    });

    it('includes a new ticket type message', () => {
      const html = generateFavoriteAlertEmail(newTypeParams);
      expect(html.toLowerCase()).toMatch(/new ticket|nuevo tipo|new type/);
    });

    it('includes the event URL as a link', () => {
      const html = generateFavoriteAlertEmail(newTypeParams);
      expect(html).toContain('https://veritix.com/events/rock-festival-2026');
    });
  });

  describe('output is valid HTML', () => {
    it('returns a string starting with DOCTYPE', () => {
      const html = generateFavoriteAlertEmail(baseParams);
      expect(html.trimStart()).toMatch(/^<!DOCTYPE html>/i);
    });
  });
});
