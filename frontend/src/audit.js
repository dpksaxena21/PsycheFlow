import { supabase } from './supabase';

export async function logAction(userId, action, resource, details = {}) {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      resource,
      details,
      created_at: new Date().toISOString()
    });
  } catch(e) {
    console.log('Audit log failed:', e);
  }
}

// Common actions
export const ACTIONS = {
  LOGIN:              'LOGIN',
  LOGOUT:             'LOGOUT',
  CONSENT_GIVEN:      'CONSENT_GIVEN',
  ASSESSMENT_STARTED: 'ASSESSMENT_STARTED',
  ASSESSMENT_DONE:    'ASSESSMENT_DONE',
  REPORT_GENERATED:   'REPORT_GENERATED',
  JOURNAL_CREATED:    'JOURNAL_CREATED',
  SHARE_CODE_GENERATED:'SHARE_CODE_GENERATED',
  PATIENT_LINKED:     'PATIENT_LINKED',
  APPOINTMENT_BOOKED: 'APPOINTMENT_BOOKED',
  MESSAGE_SENT:       'MESSAGE_SENT',
  CRISIS_TRIGGERED:   'CRISIS_TRIGGERED',
  SOAP_GENERATED:     'SOAP_GENERATED',
  REPORT_VIEWED:      'REPORT_VIEWED',
};
