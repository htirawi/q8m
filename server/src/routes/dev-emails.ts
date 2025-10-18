/**
 * Development Email Routes
 * View logged emails during development
 * Only available in development mode
 */

import { env } from "@config/env.js";
import { emailLoggerService } from "@services/email-logger.js";
import type { FastifyInstance } from "fastify";

export default async function devEmailRoutes(fastify: FastifyInstance) {
  // Only register routes in development mode
  if (env.NODE_ENV !== "development") {
    fastify.log.warn("Dev email routes are disabled in production");
    return;
  }

  // Get all logged emails
  fastify.get("/", async (_request, reply) => {
    const emails = emailLoggerService.getAllEmails();

    reply.type("text/html").send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dev Email Logger</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
          .header { background: #2563eb; color: white; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
          .stats { display: flex; gap: 1rem; margin-bottom: 2rem; }
          .stat-card { background: white; padding: 1rem; border-radius: 8px; flex: 1; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .stat-number { font-size: 2rem; font-weight: bold; color: #2563eb; }
          .stat-label { color: #666; margin-top: 0.5rem; }
          .email-list { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .email-item { padding: 1rem; border-bottom: 1px solid #e5e5e5; cursor: pointer; transition: background 0.2s; }
          .email-item:hover { background: #f9fafb; }
          .email-item:last-child { border-bottom: none; }
          .email-subject { font-weight: 600; color: #1f2937; margin-bottom: 0.5rem; }
          .email-meta { display: flex; gap: 1rem; font-size: 0.875rem; color: #666; }
          .email-to { color: #2563eb; }
          .email-date { color: #999; }
          .empty-state { text-align: center; padding: 3rem; color: #999; }
          .clear-btn { background: #dc2626; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem; margin-top: 1rem; }
          .clear-btn:hover { background: #b91c1c; }
          .refresh-btn { background: #059669; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem; margin-left: 0.5rem; }
          .refresh-btn:hover { background: #047857; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="container">
            <h1>📧 Development Email Logger</h1>
            <p style="margin-top: 0.5rem; opacity: 0.9;">View emails sent during development</p>
          </div>
        </div>
        <div class="container">
          <div class="stats">
            <div class="stat-card">
              <div class="stat-number">${emails.length}</div>
              <div class="stat-label">Total Emails</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${emailLoggerService.getCount()}</div>
              <div class="stat-label">In Memory</div>
            </div>
          </div>
          <div class="email-list">
            ${
              emails.length === 0
                ? `
              <div class="empty-state">
                <p>No emails logged yet</p>
                <p style="margin-top: 0.5rem; font-size: 0.875rem;">Register a user to see emails appear here</p>
              </div>
            `
                : emails
                    .map(
                      (email) => `
              <div class="email-item" onclick="window.location.href='/api/dev/emails/${email.id}'">
                <div class="email-subject">${email.subject}</div>
                <div class="email-meta">
                  <span class="email-to">To: ${email.to}</span>
                  <span class="email-date">${new Date(email.sentAt).toLocaleString()}</span>
                </div>
              </div>
            `
                    )
                    .join("")
            }
          </div>
          ${
            emails.length > 0
              ? `
            <div style="margin-top: 1rem;">
              <a href="/api/dev/emails/clear" class="clear-btn" style="display: inline-block; text-decoration: none;">Clear All Emails</a>
              <button type="button" class="refresh-btn" onclick="window.location.reload()">Refresh</button>
            </div>
          `
              : ""
          }
        </div>
      </body>
      </html>
    `);
  });

  // Get email by ID
  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const email = emailLoggerService.getEmailById(id);

    if (!email) {
      return reply.status(404).send({ error: "Email not found" });
    }

    reply.type("text/html").send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${email.subject}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
          .header { background: #2563eb; color: white; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
          .back-btn { display: inline-block; background: white; color: #2563eb; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; margin-bottom: 1rem; }
          .back-btn:hover { background: #f0f9ff; }
          .email-card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 2rem; }
          .email-meta { border-bottom: 1px solid #e5e5e5; padding-bottom: 1rem; margin-bottom: 1rem; }
          .meta-row { display: flex; gap: 1rem; margin-bottom: 0.5rem; }
          .meta-label { font-weight: 600; color: #666; min-width: 100px; }
          .meta-value { color: #1f2937; }
          .email-content { margin-top: 2rem; }
          .tab-buttons { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
          .tab-btn { background: #f3f4f6; border: none; padding: 0.75rem 1.5rem; cursor: pointer; border-radius: 6px; }
          .tab-btn.active { background: #2563eb; color: white; }
          .tab-content { display: none; }
          .tab-content.active { display: block; }
        </style>
        <script>
          function showTab(tab) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById('tab-' + tab).classList.add('active');
            document.getElementById('content-' + tab).classList.add('active');
          }
        </script>
      </head>
      <body>
        <div class="header">
          <div class="container">
            <h1>📧 Email Details</h1>
          </div>
        </div>
        <div class="container">
          <a href="/api/dev/emails" class="back-btn">← Back to List</a>
          <div class="email-card">
            <div class="email-meta">
              <div class="meta-row">
                <div class="meta-label">To:</div>
                <div class="meta-value">${email.to}</div>
              </div>
              <div class="meta-row">
                <div class="meta-label">Subject:</div>
                <div class="meta-value">${email.subject}</div>
              </div>
              <div class="meta-row">
                <div class="meta-label">Sent At:</div>
                <div class="meta-value">${new Date(email.sentAt).toLocaleString()}</div>
              </div>
            </div>
            <div class="email-content">
              <div class="tab-buttons">
                <button id="tab-html" class="tab-btn active" onclick="showTab('html')">HTML Preview</button>
                <button id="tab-text" class="tab-btn" onclick="showTab('text')">Plain Text</button>
              </div>
              <div id="content-html" class="tab-content active">
                <iframe srcdoc="${email.html.replace(/"/g, "&quot;")}" style="width: 100%; height: 600px; border: 1px solid #e5e5e5; border-radius: 6px;"></iframe>
              </div>
              <div id="content-text" class="tab-content">
                <pre style="white-space: pre-wrap; background: #f9fafb; padding: 1rem; border-radius: 6px; font-family: monospace; font-size: 0.875rem;">${email.text}</pre>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
  });

  // Clear all emails (simple GET request)
  fastify.get("/clear", async (_request, reply) => {
    emailLoggerService.clearAll();
    reply.redirect("/api/dev/emails");
  });
}
