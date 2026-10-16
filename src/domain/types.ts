export type Role = 'traveler' | 'youth' | 'operator'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type CancelSource = 'traveler' | 'operator'
export type TaskApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
export type ResourceType = 'person' | 'space' | 'skill' | 'product' | 'culture' | 'story' | 'relationship' | 'idle'
export type DraftStage = 'resource' | 'draft' | 'pilot' | 'feedback' | 'published'

export interface Experience { id: string; title: string; category: string; description: string; location: string; meetingPoint: string; durationMinutes: number; price: number; image: string; tags: string[]; featured?: boolean; published: boolean; sourceDraftId?: string; isDemo: true }
export interface Session { id: string; experienceId: string; date: string; startTime: string; endTime: string; capacity: number; pilot: boolean }
export interface Booking { id: string; sessionId: string; experienceId: string; travelerId: string; partySize: number; status: BookingStatus; createdAt: string; cancelReason?: string; cancelSource?: CancelSource; cancelledAt?: string }
export interface ItineraryItem { id: string; kind: 'experience' | 'free'; experienceId?: string; sessionId?: string; title: string; date: string; startTime: string; endTime: string; price: number }
export interface Itinerary { id: string; travelerId: string; title: string; date: string; budget: number; interests: string[]; items: ItineraryItem[]; updatedAt: string }
export interface Task { id: string; title: string; category: string; description: string; date: string; startTime: string; endTime: string; hours: number; pay: number; slots: number; eligible: boolean; location: string }
export interface TaskApplication { id: string; taskId: string; youthId: string; status: TaskApplicationStatus; appliedAt: string }
export interface Resource { id: string; name: string; type: ResourceType; description: string; partner: string; availability: string }
export interface ExperienceDraft { id: string; title: string; resourceIds: string[]; description: string; stage: DraftStage; publishedExperienceId?: string }
export interface PilotSession { id: string; draftId: string; date: string; capacity: number; label: '試辦' }
export interface Feedback { id: string; draftId: string; author: string; rating: number; text: string }
export interface ChangeLogEntry { id: string; draftId: string; actorId: string; at: string; note: string }
export interface AppState { schemaVersion: 1; role: Role; travelerId: string; youthId: string; experiences: Experience[]; sessions: Session[]; bookings: Booking[]; itineraries: Itinerary[]; tasks: Task[]; applications: TaskApplication[]; resources: Resource[]; drafts: ExperienceDraft[]; pilotSessions: PilotSession[]; feedback: Feedback[]; changeLog: ChangeLogEntry[] }
export type DomainResult<T> = { ok: true; value: T; valueId?: string } | { ok: false; error: { code: string; message: string } }
