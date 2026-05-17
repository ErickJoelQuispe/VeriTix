import { generateTransferInviteEmail } from './transfer-invite.template';

describe('generateTransferInviteEmail', () => {
  const baseParams = {
    senderName: 'Bob',
    eventName: 'Summer Jam 2026',
    eventDate: 'July 12, 2026',
    acceptUrl: 'https://veritix.com/ticket-transfers/accept?token=abc123',
    isNewUser: false,
  };

  describe('existing user (isNewUser: false)', () => {
    it('includes the sender name', () => {
      const html = generateTransferInviteEmail(baseParams);
      expect(html).toContain('Bob');
    });

    it('includes the event name', () => {
      const html = generateTransferInviteEmail(baseParams);
      expect(html).toContain('Summer Jam 2026');
    });

    it('includes the event date', () => {
      const html = generateTransferInviteEmail(baseParams);
      expect(html).toContain('July 12, 2026');
    });

    it('includes the acceptUrl as a link', () => {
      const html = generateTransferInviteEmail(baseParams);
      expect(html).toContain('https://veritix.com/ticket-transfers/accept?token=abc123');
    });

    it('does not mention registration for existing users', () => {
      const html = generateTransferInviteEmail(baseParams);
      expect(html.toLowerCase()).not.toMatch(/create.*account|register|sign up/);
    });
  });

  describe('new user (isNewUser: true)', () => {
    const newUserParams = {
      ...baseParams,
      acceptUrl: 'https://veritix.com/register?transferToken=abc123',
      isNewUser: true,
    };

    it('includes the sender name', () => {
      const html = generateTransferInviteEmail(newUserParams);
      expect(html).toContain('Bob');
    });

    it('includes the event name', () => {
      const html = generateTransferInviteEmail(newUserParams);
      expect(html).toContain('Summer Jam 2026');
    });

    it('includes registration guidance text for new users', () => {
      const html = generateTransferInviteEmail(newUserParams);
      expect(html.toLowerCase()).toMatch(/create.*account|register|sign up/);
    });

    it('includes the registration acceptUrl as a link', () => {
      const html = generateTransferInviteEmail(newUserParams);
      expect(html).toContain('https://veritix.com/register?transferToken=abc123');
    });
  });

  describe('output is valid HTML', () => {
    it('returns a string starting with DOCTYPE', () => {
      const html = generateTransferInviteEmail(baseParams);
      expect(html.trimStart()).toMatch(/^<!DOCTYPE html>/i);
    });
  });
});
