/**
 * Interfaces de servicios externos.
 *
 * M05 define SOLO los contratos; las implementaciones llegan después:
 * `LeadService` y `MailService` en M09/D5, `NomaService` en M10. Declararlos
 * ahora permite que el dominio se escriba contra la interfaz y que los hitos
 * siguientes no tengan que reabrir esta capa.
 */

export interface LeadDraft {
  readonly formSlug: string;
  readonly name: string;
  readonly email: string;
  readonly company?: string;
  readonly message?: string;
  readonly consentGiven: boolean;
  readonly consentVersion: string;
  readonly originSlug?: string;
  readonly utm?: Readonly<Record<string, string | undefined>>;
}

export interface LeadService {
  /** Persiste el lead y devuelve su identificador. */
  capture(draft: LeadDraft): Promise<{ leadId: string }>;
}

export interface MailMessage {
  readonly to: readonly string[];
  readonly subject: string;
  readonly text: string;
  readonly html?: string;
}

export interface MailService {
  /**
   * Envío best-effort: quien llame no debe fallar si esto falla. El dato ya está
   * persistido antes de intentar notificar.
   */
  send(message: MailMessage): Promise<{ delivered: boolean }>;
}

export interface NotificationService {
  notify(event: string, payload: Readonly<Record<string, unknown>>): Promise<void>;
}
