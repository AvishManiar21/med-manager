/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Appointment, Patient } from '../types';

export interface ReminderResult {
  success: boolean;
  sent: number;
  failed: number;
  errors: string[];
}

/**
 * Sends appointment reminder emails for upcoming appointments
 * @param hoursAhead - Number of hours ahead to check for appointments (default: 24)
 * @returns Result object with success count and errors
 */
export async function sendAppointmentReminders(hoursAhead: number = 24): Promise<ReminderResult> {
  const result: ReminderResult = {
    success: false,
    sent: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Calculate the date range for reminders
    const now = new Date();
    const targetDate = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
    const targetDateString = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Query appointments for the target date
    const appointmentsRef = collection(db, 'appointments');
    const q = query(
      appointmentsRef,
      where('date', '==', targetDateString),
      where('status', '==', 'Scheduled')
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      result.success = true;
      return result;
    }

    // Process each appointment
    for (const appointmentDoc of snapshot.docs) {
      const appointment = { id: appointmentDoc.id, ...appointmentDoc.data() } as Appointment;

      // Skip if reminder already sent (if field exists)
      if ((appointment as any).reminderSent) {
        continue;
      }

      try {
        // Get patient details to fetch email
        let patientEmail = (appointment as any).patientEmail;

        if (!patientEmail && appointment.patientId) {
          // Fetch patient email from patients collection
          const patientRef = collection(db, 'patients');
          const patientQuery = query(patientRef, where('id', '==', appointment.patientId));
          const patientSnapshot = await getDocs(patientQuery);

          if (!patientSnapshot.empty) {
            const patient = patientSnapshot.docs[0].data() as Patient;
            patientEmail = patient.email;
          }
        }

        if (!patientEmail) {
          result.errors.push(`No email found for appointment ${appointment.id} (Patient: ${appointment.patientName})`);
          result.failed++;
          continue;
        }

        // Send reminder email
        const emailSuccess = await sendReminderEmail(appointment, patientEmail);

        if (emailSuccess) {
          // Update appointment with reminder sent flag
          await updateDoc(doc(db, 'appointments', appointment.id), {
            reminderSent: true,
            reminderSentAt: new Date().toISOString(),
          });

          result.sent++;
        } else {
          result.errors.push(`Failed to send email for appointment ${appointment.id}`);
          result.failed++;
        }
      } catch (error: any) {
        result.errors.push(`Error processing appointment ${appointment.id}: ${error.message}`);
        result.failed++;
      }
    }

    result.success = true;
    return result;
  } catch (error: any) {
    result.errors.push(`Failed to query appointments: ${error.message}`);
    return result;
  }
}

/**
 * Sends a reminder email using the Cloudflare Pages function
 */
async function sendReminderEmail(appointment: Appointment, email: string): Promise<boolean> {
  try {
    // Format appointment date and time nicely
    const appointmentDate = new Date(appointment.date);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Create email HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Reminder</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: #f9fafb;
            padding: 30px 20px;
            border-radius: 0 0 10px 10px;
          }
          .appointment-details {
            background: white;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .detail-row {
            margin: 10px 0;
            display: flex;
            justify-content: space-between;
          }
          .detail-label {
            font-weight: 600;
            color: #6b7280;
          }
          .detail-value {
            color: #111827;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">DentalFlow Pro</h1>
          <p style="margin: 10px 0 0 0;">Appointment Reminder</p>
        </div>
        <div class="content">
          <p>Dear ${appointment.patientName},</p>
          <p>This is a friendly reminder about your upcoming dental appointment.</p>

          <div class="appointment-details">
            <h2 style="margin-top: 0; color: #667eea;">Appointment Details</h2>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${formattedDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${appointment.time}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Service:</span>
              <span class="detail-value">${appointment.serviceType}</span>
            </div>
          </div>

          <p><strong>Important:</strong> Please arrive 10 minutes before your scheduled time. If you need to reschedule or cancel, please contact us as soon as possible.</p>

          <div class="footer">
            <p>DentalFlow Pro - Professional Dental Care</p>
            <p style="font-size: 12px; color: #9ca3af;">This is an automated reminder. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Call the Cloudflare Pages email function
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: `Reminder: Your Dental Appointment on ${formattedDate}`,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Email sending failed:', errorData);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('Error sending reminder email:', error);
    return false;
  }
}

/**
 * Gets a summary of upcoming appointments that need reminders
 * @param hoursAhead - Number of hours ahead to check
 */
export async function getUpcomingAppointmentsSummary(hoursAhead: number = 24): Promise<{
  count: number;
  appointments: Appointment[];
}> {
  try {
    const now = new Date();
    const targetDate = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
    const targetDateString = targetDate.toISOString().split('T')[0];

    const appointmentsRef = collection(db, 'appointments');
    const q = query(
      appointmentsRef,
      where('date', '==', targetDateString),
      where('status', '==', 'Scheduled')
    );

    const snapshot = await getDocs(q);
    const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));

    // Filter out appointments where reminder was already sent
    const needingReminders = appointments.filter(apt => !(apt as any).reminderSent);

    return {
      count: needingReminders.length,
      appointments: needingReminders,
    };
  } catch (error: any) {
    console.error('Error fetching upcoming appointments:', error);
    return {
      count: 0,
      appointments: [],
    };
  }
}
