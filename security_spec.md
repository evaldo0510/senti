# Security Specification & Test-Driven Design (TDD)
## System: SentiPae (Pronto Socorro Emocional)

This document establishes the absolute security invariants, threat vectors, and malicious payloads designed to test and harden the Firestore security rules.

---

### 1. Data Invariants (Identity, Integrity, and State)

1. **User Profile Isolation (LGPD)**: A user's profile (`users/{userId}`) can only be written or updated by the authenticated user themselves (`request.auth.uid == userId`). No user can change their own role (`tipo`) to unauthorized levels (e.g., self-assigning `admin` or `terapeuta`).
2. **Patient-Therapist Appointment Boundaries**: An appointment (`appointments/{appointmentId}`) must involve the authenticated user as either the patient or the therapist. No external user can read, create, or update an appointment.
3. **Chat Privacy**: Messages in `messages/{messageId}` are restricted strictly to the sender and the receiver of the message. No third party can list or read these messages.
4. **Clinical Notes Sovereignty**: Private clinical notes (`private_notes/{noteId}`) are stored exclusively by therapists. A patient or third party is strictly forbidden from reading or writing these private notes.
5. **Therapist Profile Transparency**: Therapist profiles are public to authenticated users to allow finding professionals, but only the therapists themselves can modify their core professional details.
6. **Immutable Fields**: Critical audit and lifecycle fields such as `createdAt` and `userId` must remain immutable after document creation.
7. **Temporal Integrity**: All timestamp fields (`createdAt`, `updatedAt`, etc.) must be authenticated and validated against the Firestore server's actual clock (`request.time`).

---

### 2. The "Dirty Dozen" Malicious Payloads

The following 12 JSON payloads represent high-risk attack vectors designed to violate our data invariants. Our Firestore rules must reject every single one of them with `PERMISSION_DENIED`.

#### Payload 1: Spoofed User Profile Registration
* **Attack**: User B (`attacker_123`) attempts to register a profile under User A's UID (`victim_456`).
* **Payload**:
```json
{
  "uid": "victim_456",
  "nome": "Victim User",
  "email": "victim@example.com",
  "tipo": "usuario"
}
```
* **Target Path**: `users/victim_456`
* **Expected Result**: `PERMISSION_DENIED` (auth.uid does not match path/payload).

#### Payload 2: Unauthorized Profile Tampering
* **Attack**: User B (`attacker_123`) attempts to modify the specialty or rating of Therapist A (`therapist_789`).
* **Payload**:
```json
{
  "especialidade": "Ansiedade Geral (Hackeado)",
  "rating": 5.0
}
```
* **Target Path**: `users/therapist_789`
* **Expected Result**: `PERMISSION_DENIED` (not owner of the therapist profile).

#### Payload 3: Privilege Escalation (Self-Assigned Admin/Therapist)
* **Attack**: A standard user (`patient_111`) attempts to change their own role (`tipo`) to `admin` or `terapeuta`.
* **Payload**:
```json
{
  "tipo": "admin"
}
```
* **Target Path**: `users/patient_111`
* **Expected Result**: `PERMISSION_DENIED` (cannot modify role/tipo field).

#### Payload 4: Hijacked Appointment Booking
* **Attack**: User B (`attacker_123`) schedules an appointment on behalf of User A (`victim_456`) without consent.
* **Payload**:
```json
{
  "patientId": "victim_456",
  "therapistId": "therapist_789",
  "date": "2026-06-30",
  "time": "14:00",
  "status": "pending"
}
```
* **Target Path**: `appointments/new_appointment_id`
* **Expected Result**: `PERMISSION_DENIED` (authenticated user must be patientId or therapistId).

#### Payload 5: Sneaky Appointment Status Tampering
* **Attack**: A patient (`patient_111`) attempts to confirm or complete an appointment belonging to another patient, bypassing therapist authorization.
* **Payload**:
```json
{
  "status": "confirmed"
}
```
* **Target Path**: `appointments/victim_appointment_999`
* **Expected Result**: `PERMISSION_DENIED` (not therapist or not participant).

#### Payload 6: Clinical Notes Espionage (Patient Reading Private Notes)
* **Attack**: A patient (`patient_111`) attempts to read or write into the `private_notes` collection containing sensitive diagnostic/session notes.
* **Payload**:
```json
{
  "therapistId": "therapist_789",
  "patientId": "patient_111",
  "encryptedContent": "Patient shows severe paranoia."
}
```
* **Target Path**: `private_notes/note_123`
* **Expected Result**: `PERMISSION_DENIED` (patients cannot read or write to `private_notes`).

#### Payload 7: Chat Impersonation (Spoofing Sender ID)
* **Attack**: User B (`attacker_123`) sends a message setting the `senderId` as User A (`victim_456`).
* **Payload**:
```json
{
  "senderId": "victim_456",
  "receiverId": "therapist_789",
  "text": "Please cancel my therapy sessions.",
  "timestamp": "request.time"
}
```
* **Target Path**: `messages/msg_999`
* **Expected Result**: `PERMISSION_DENIED` (senderId must match auth.uid).

#### Payload 8: Unauthorized Chat Eavesdropping
* **Attack**: User C (`attacker_123`) tries to read or query message history between User A and User B.
* **Query**: `collection("messages").where("appointmentId", "==", "session_abc")`
* **Expected Result**: `PERMISSION_DENIED` (user is not sender, receiver, or participant).

#### Payload 9: Private Diary Snoop
* **Attack**: User B (`attacker_123`) attempts to list or read User A's (`patient_111`) private diary entries.
* **Query**: `collection("diary_entries").where("userId", "==", "patient_111")`
* **Expected Result**: `PERMISSION_DENIED` (userId does not match auth.uid).

#### Payload 10: Malicious Mood/Emotion Log Injection
* **Attack**: User B (`attacker_123`) attempts to inject fake, depressing logs into User A's (`patient_111`) emotional history.
* **Payload**:
```json
{
  "userId": "patient_111",
  "emotion": "Deprimido",
  "intensity": 10,
  "timestamp": "2026-06-24T12:00:00Z"
}
```
* **Target Path**: `emotion_logs/log_999`
* **Expected Result**: `PERMISSION_DENIED` (userId must match auth.uid).

#### Payload 11: Unauthorized IARA Memory Hijack
* **Attack**: User B (`attacker_123`) tries to rewrite or delete User A's (`patient_111`) companion AI memory profile.
* **Payload**:
```json
{
  "perfil": {
    "nome": "Patient A",
    "emocaoAtual": "Manipulado"
  },
  "historico": []
}
```
* **Target Path**: `memoria_iara/patient_111`
* **Expected Result**: `PERMISSION_DENIED` (document ID/userId must match auth.uid).

#### Payload 12: Invalid ID Poisoning (Resource Exhaustion / Buffer Attack)
* **Attack**: An attacker attempts to create a diary entry or appointment using an ID string that is 2000 characters long to cause database inflation.
* **Payload**:
```json
{
  "userId": "attacker_123",
  "content": "Short test entry",
  "timestamp": "2026-06-24T12:00:00Z"
}
```
* **Target Path**: `diary_entries/` + `A * 2000` (length 2000 string)
* **Expected Result**: `PERMISSION_DENIED` (ID exceeds the 128 character path validation limit).

---

### 3. Test Runner Configuration (`firestore.rules.test.ts`)

A mock test suite verifying these rules can be represented programmatically using the `@firebase/rules-unit-testing` framework.

```typescript
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'senti-pwa-rules-test',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: 'localhost',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('SentiPae Firestore Rules Security Audit', () => {
  test('Payload 1: Spoofed User profile creation should be REJECTED', async () => {
    const context = testEnv.authenticatedContext('attacker_123');
    const db = context.firestore();
    const docRef = db.doc('users/victim_456');
    await expect(docRef.set({
      uid: 'victim_456',
      nome: 'Victim User',
      email: 'victim@example.com',
      tipo: 'usuario'
    })).rejects.toThrow();
  });

  test('Payload 3: Privilege Escalation should be REJECTED', async () => {
    const context = testEnv.authenticatedContext('patient_111');
    const db = context.firestore();
    const docRef = db.doc('users/patient_111');
    await expect(docRef.update({
      tipo: 'admin'
    })).rejects.toThrow();
  });

  test('Payload 6: Patient reading or writing private clinical notes should be REJECTED', async () => {
    const context = testEnv.authenticatedContext('patient_111');
    const db = context.firestore();
    const docRef = db.doc('private_notes/note_123');
    await expect(docRef.get()).rejects.toThrow();
    await expect(docRef.set({
      therapistId: 'therapist_789',
      patientId: 'patient_111',
      encryptedContent: 'Patient session log'
    })).rejects.toThrow();
  });
});
```
