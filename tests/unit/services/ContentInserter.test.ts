import { ContentInserter } from '../../../src/services/email/ContentInserter';

// Mock Office namespace
const AsyncResultStatus = {
  Succeeded: 'succeeded' as const,
  Failed: 'failed' as const,
};

global.Office = {
  context: {
    mailbox: {
      item: {
        body: {
          getAsync: jest.fn(),
          setAsync: jest.fn(),
        },
      },
    },
  },
  AsyncResultStatus,
  CoercionType: {
    Html: 'html' as const,
    Text: 'text' as const,
  },
} as any;

describe('ContentInserter', () => {
  let inserter: ContentInserter;

  beforeEach(() => {
    jest.clearAllMocks();
    inserter = new ContentInserter();
  });

  describe('insertContent', () => {
    it('should insert content at beginning when no signature', async () => {
      const existingContent = '<div><p>Existing email content</p></div>';
      const newContent = 'New AI-generated content';

      (Office.context.mailbox.item.body.getAsync as jest.Mock).mockImplementation((_, callback) => {
        callback({ status: 'succeeded', value: existingContent });
      });

      (Office.context.mailbox.item.body.setAsync as jest.Mock).mockImplementation(
        (_, __, callback) => {
          callback({ status: 'succeeded' });
        }
      );

      await inserter.insertContent(newContent, -1);

      expect(Office.context.mailbox.item.body.setAsync).toHaveBeenCalled();
      const insertedContent = (Office.context.mailbox.item.body.setAsync as jest.Mock).mock
        .calls[0][0];
      expect(insertedContent).toContain(newContent);
      expect(insertedContent).toContain(existingContent);
    });

    it('should insert content above signature', async () => {
      const existingContent = `
        <div>
          <p>Email content</p>
          <p>Best regards,</p>
          <p>John</p>
        </div>
      `;
      const newContent = 'New AI-generated content';
      const signaturePosition = existingContent.indexOf('Best regards');

      (Office.context.mailbox.item.body.getAsync as jest.Mock).mockImplementation((_, callback) => {
        callback({ status: 'succeeded', value: existingContent });
      });

      (Office.context.mailbox.item.body.setAsync as jest.Mock).mockImplementation(
        (_, __, callback) => {
          callback({ status: 'succeeded' });
        }
      );

      await inserter.insertContent(newContent, signaturePosition);

      const insertedContent = (Office.context.mailbox.item.body.setAsync as jest.Mock).mock
        .calls[0][0];
      const newContentIndex = insertedContent.indexOf(newContent);
      const signatureIndex = insertedContent.indexOf('Best regards');

      expect(newContentIndex).toBeLessThan(signatureIndex);
    });

    it('should preserve HTML formatting', async () => {
      const existingContent = '<div><p>Existing content</p></div>';
      const newContent = '<p><strong>Bold</strong> and <em>italic</em></p>';

      (Office.context.mailbox.item.body.getAsync as jest.Mock).mockImplementation((_, callback) => {
        callback({ status: 'succeeded', value: existingContent });
      });

      (Office.context.mailbox.item.body.setAsync as jest.Mock).mockImplementation(
        (_, __, callback) => {
          callback({ status: 'succeeded' });
        }
      );

      await inserter.insertContent(newContent, -1);

      const insertedContent = (Office.context.mailbox.item.body.setAsync as jest.Mock).mock
        .calls[0][0];
      expect(insertedContent).toContain('<strong>');
      expect(insertedContent).toContain('<em>');
    });

    it('should handle empty existing content', async () => {
      const newContent = 'New content';

      (Office.context.mailbox.item.body.getAsync as jest.Mock).mockImplementation((_, callback) => {
        callback({ status: 'succeeded', value: '' });
      });

      (Office.context.mailbox.item.body.setAsync as jest.Mock).mockImplementation(
        (_, __, callback) => {
          callback({ status: 'succeeded' });
        }
      );

      await inserter.insertContent(newContent, -1);

      expect(Office.context.mailbox.item.body.setAsync).toHaveBeenCalled();
    });

    it('should throw error on failure', async () => {
      (Office.context.mailbox.item.body.getAsync as jest.Mock).mockImplementation((_, callback) => {
        callback({ status: 'failed', error: { message: 'Failed to get content' } });
      });

      await expect(inserter.insertContent('content', -1)).rejects.toThrow();
    });

    it('should add separator between new and existing content', async () => {
      const existingContent = '<div><p>Existing content</p></div>';
      const newContent = 'New content';

      (Office.context.mailbox.item.body.getAsync as jest.Mock).mockImplementation((_, callback) => {
        callback({ status: 'succeeded', value: existingContent });
      });

      (Office.context.mailbox.item.body.setAsync as jest.Mock).mockImplementation(
        (_, __, callback) => {
          callback({ status: 'succeeded' });
        }
      );

      await inserter.insertContent(newContent, -1);

      const insertedContent = (Office.context.mailbox.item.body.setAsync as jest.Mock).mock
        .calls[0][0];
      // Should have some separation between contents
      expect(insertedContent.length).toBeGreaterThan(newContent.length + existingContent.length);
    });
  });

  describe('insertContentAtPosition', () => {
    it('should insert at specific position', async () => {
      const content = '<div><p>Part 1</p><p>Part 2</p></div>';
      const newContent = '<p>Inserted</p>';
      const position = content.indexOf('Part 2');

      (Office.context.mailbox.item.body.getAsync as jest.Mock).mockImplementation((_, callback) => {
        callback({ status: 'succeeded', value: content });
      });

      (Office.context.mailbox.item.body.setAsync as jest.Mock).mockImplementation(
        (_, __, callback) => {
          callback({ status: 'succeeded' });
        }
      );

      await inserter.insertContentAtPosition(newContent, position);

      const insertedContent = (Office.context.mailbox.item.body.setAsync as jest.Mock).mock
        .calls[0][0];
      expect(insertedContent).toContain('Inserted');
    });

    it('should handle invalid position', async () => {
      const content = '<div><p>Content</p></div>';
      const newContent = '<p>New</p>';

      (Office.context.mailbox.item.body.getAsync as jest.Mock).mockImplementation((_, callback) => {
        callback({ status: 'succeeded', value: content });
      });

      await expect(inserter.insertContentAtPosition(newContent, -10)).rejects.toThrow();
    });
  });

  describe('prependContent', () => {
    it('should prepend content to beginning', async () => {
      const existingContent = '<div><p>Existing</p></div>';
      const newContent = '<p>Prepended</p>';

      (Office.context.mailbox.item.body.getAsync as jest.Mock).mockImplementation((_, callback) => {
        callback({ status: 'succeeded', value: existingContent });
      });

      (Office.context.mailbox.item.body.setAsync as jest.Mock).mockImplementation(
        (_, __, callback) => {
          callback({ status: 'succeeded' });
        }
      );

      await inserter.prependContent(newContent);

      const insertedContent = (Office.context.mailbox.item.body.setAsync as jest.Mock).mock
        .calls[0][0];
      expect(insertedContent.indexOf('Prepended')).toBeLessThan(
        insertedContent.indexOf('Existing')
      );
    });

    it('should handle empty existing content', async () => {
      const newContent = '<p>New content</p>';

      (Office.context.mailbox.item.body.getAsync as jest.Mock).mockImplementation((_, callback) => {
        callback({ status: 'succeeded', value: '' });
      });

      (Office.context.mailbox.item.body.setAsync as jest.Mock).mockImplementation(
        (_, __, callback) => {
          callback({ status: 'succeeded' });
        }
      );

      await inserter.prependContent(newContent);

      expect(Office.context.mailbox.item.body.setAsync).toHaveBeenCalled();
    });
  });

  describe('appendContent', () => {
    it('should append content to end', async () => {
      const existingContent = '<div><p>Existing</p></div>';
      const newContent = '<p>Appended</p>';

      (Office.context.mailbox.item.body.getAsync as jest.Mock).mockImplementation((_, callback) => {
        callback({ status: 'succeeded', value: existingContent });
      });

      (Office.context.mailbox.item.body.setAsync as jest.Mock).mockImplementation(
        (_, __, callback) => {
          callback({ status: 'succeeded' });
        }
      );

      await inserter.appendContent(newContent);

      const insertedContent = (Office.context.mailbox.item.body.setAsync as jest.Mock).mock
        .calls[0][0];
      expect(insertedContent.indexOf('Existing')).toBeLessThan(insertedContent.indexOf('Appended'));
    });
  });

  describe('getInsertionHistory', () => {
    it('should track insertion history', async () => {
      const content = 'Test content';

      (Office.context.mailbox.item.body.getAsync as jest.Mock).mockImplementation((_, callback) => {
        callback({ status: 'succeeded', value: '<div></div>' });
      });

      (Office.context.mailbox.item.body.setAsync as jest.Mock).mockImplementation(
        (_, __, callback) => {
          callback({ status: 'succeeded' });
        }
      );

      await inserter.prependContent(content);

      const history = inserter.getInsertionHistory();
      expect(history).toHaveLength(1);
      expect(history[0].content).toBe(content);
    });

    it('should record multiple insertions', async () => {
      (Office.context.mailbox.item.body.getAsync as jest.Mock).mockImplementation((_, callback) => {
        callback({ status: 'succeeded', value: '<div></div>' });
      });

      (Office.context.mailbox.item.body.setAsync as jest.Mock).mockImplementation(
        (_, __, callback) => {
          callback({ status: 'succeeded' });
        }
      );

      await inserter.prependContent('First');
      await inserter.prependContent('Second');

      const history = inserter.getInsertionHistory();
      expect(history).toHaveLength(2);
    });
  });

  describe('canUndo', () => {
    it('should return true when history exists', async () => {
      (Office.context.mailbox.item.body.getAsync as jest.Mock).mockImplementation((_, callback) => {
        callback({ status: 'succeeded', value: '<div></div>' });
      });

      (Office.context.mailbox.item.body.setAsync as jest.Mock).mockImplementation(
        (_, __, callback) => {
          callback({ status: 'succeeded' });
        }
      );

      await inserter.prependContent('Content');

      expect(inserter.canUndo()).toBe(true);
    });

    it('should return false when no history', () => {
      expect(inserter.canUndo()).toBe(false);
    });
  });

  describe('formatAsHtml', () => {
    it('should convert plain text to HTML', () => {
      const plainText = 'Simple text';
      const html = inserter.formatAsHtml(plainText);

      expect(html).toContain('<');
      expect(html).toContain(plainText);
    });

    it('should preserve existing HTML', () => {
      const htmlContent = '<p>Already HTML</p>';
      const html = inserter.formatAsHtml(htmlContent);

      expect(html).toBe(htmlContent);
    });

    it('should handle empty content', () => {
      const html = inserter.formatAsHtml('');

      expect(html).toBeDefined();
    });
  });
});
