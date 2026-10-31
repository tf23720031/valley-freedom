export type Role = 'traveler' | 'companion' | 'operator' | 'admin'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type CancelSource = 'traveler' | 'operator'
export type TaskApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
export type ResourceType = 'person' | 'space' | 'skill' | 'product' | 'culture' | 'story' | 'relationship' | 'idle'
export type DraftStage = 'resource' | 'draft' | 'pilot' | 'feedback' | 'published'

export interface Experience { id: string; title: string; category: string; description: string; location: string; meetingPoint: string; durationMinutes: number; price: number; image: string; tags: string[]; featured?: boolean; published: boolean; sourceDraftId?: string; isDemo: true }
export interface Session { id: string; experienceId: string; date: string; startTime: string; endTime: string; capacity: number; pilot: boolean }
export interface Booking { id: string; sessionId: string; experienceId: string; travelerId: string; partySize: number; travelerCount?: number; includesCompanion?: boolean; serviceRequestId?: string; status: BookingStatus; createdAt: string; cancelReason?: string; cancelSource?: CancelSource; cancelledAt?: string }
export interface ItineraryItem { id: string; kind: 'experience' | 'free' | 'companion'; experienceId?: string; sessionId?: string; bookingId?: string; partySize?: number; companionIncluded?: boolean; companionRequestId?: string; serviceRequestId?: string; placeId?: string; category?: string; place?: string; note?: string; title: string; date: string; startTime: string; endTime: string; price: number }
export interface Itinerary { id: string; travelerId: string; title: string; date: string; endDate?: string; dayCount?: number; budget: number; interests: string[]; items: ItineraryItem[]; updatedAt: string; submissionStatus?: 'draft' | 'partial' | 'submitted' }
export type CompanionService = 'companionship' | 'event-support' | 'language-support' | 'local-information'
export type ServiceRequestStatus = 'pending' | 'accepted' | 'countered' | 'confirmed' | 'rejected' | 'cancelled' | 'completed'
export interface CompanionAvailability { id: string; date: string; startTime: string; endTime: string }
export interface Companion { id: string; name: string; avatar: string; bio: string; serviceAreas: string[]; languages: string[]; services: CompanionService[]; qualifications: string[]; restrictions: string[]; interests?: string[]; ratePerHour: number; availability: CompanionAvailability[]; demo: true }
export interface ServiceRequest { id: string; travelerId: string; companionId: string; itineraryId?: string; status: ServiceRequestStatus; destination: string; meetingPoint: string; date: string; startTime: string; durationMinutes: number; partySize: number; language: string; service: CompanionService; notes: string; price: number; discountAmount?: number; rewardId?: string; proposed?: { startTime: string; durationMinutes: number; price: number; note: string }; decisionNote?: string; cancelReason?: string; cancelSource?: 'traveler' | 'companion'; createdAt: string; updatedAt: string }
export type CompanionDemandStatus = 'open' | 'matched' | 'cancelled' | 'expired'
export type DemandApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'closed'
export interface CompanionDemand { id: string; travelerId: string; itineraryId?: string; date: string; startTime: string; durationMinutes: number; meetingPoint: string; destination: string; language: string; skills: CompanionService[]; maxBudget: number; travelerCount: number; notes: string; status: CompanionDemandStatus; createdAt: string; acceptedApplicationId?: string }
export interface DemandApplication { id: string; demandId: string; companionId: string; quote: number; proposal: string; status: DemandApplicationStatus; appliedAt: string }
export interface ShopProfile { id: string; name: string; introduction: string; address: string; contact: string; website: string; region: string }
export interface Task { id: string; title: string; category: string; description: string; date: string; startTime: string; endTime: string; hours: number; pay: number; slots: number; eligible: boolean; location: string }
export interface TaskApplication { id: string; taskId: string; youthId: string; status: TaskApplicationStatus; appliedAt: string }
export interface Resource { id: string; name: string; type: ResourceType; description: string; partner: string; availability: string }
export interface ExperienceDraft { id: string; title: string; resourceIds: string[]; description: string; stage: DraftStage; publishedExperienceId?: string }
export interface PilotSession { id: string; draftId: string; date: string; capacity: number; label: '試辦' }
export interface Feedback { id: string; draftId: string; author: string; rating: number; text: string }
export interface ChangeLogEntry { id: string; draftId: string; actorId: string; at: string; note: string }
export interface PlaceStamp { id: string; placeId: string; stampedAt: string; mode: 'demo' }
export interface PlaceRating { id: string; placeId: string; rating: number; createdAt: string }
export interface RouteReward { id: string; kind: 'companion-200'; amount: 200; status: 'available' | 'redeemed'; stampIds: string[]; createdAt: string; redeemedRequestId?: string }
export interface PartnerLink { id: string; anchorPlaceId: string; smallPlaceId: string; offerType: 'coupon' | 'add-on' | 'bundle'; description: string; active: boolean }
export interface SubsidyRecord { id: string; placeId: string; month: string; amount: number; description: string }
export interface PlaceMetric { placeId: string; size: 'small' | 'large'; lastMonthVisits: number; thisMonthVisits: number; views: number; qrScans: number; conversions: number; monthlySubsidyLimit: number }
export interface AppState { schemaVersion: 4; authenticated: boolean; rememberLogin: boolean; role: Role; travelerId: string; youthId: string; companionId: string; experiences: Experience[]; sessions: Session[]; bookings: Booking[]; itineraries: Itinerary[]; companions: Companion[]; serviceRequests: ServiceRequest[]; companionDemands: CompanionDemand[]; demandApplications: DemandApplication[]; shopProfile: ShopProfile; tasks: Task[]; applications: TaskApplication[]; resources: Resource[]; drafts: ExperienceDraft[]; pilotSessions: PilotSession[]; feedback: Feedback[]; changeLog: ChangeLogEntry[]; placeStamps: PlaceStamp[]; placeRatings: PlaceRating[]; routeRewards: RouteReward[]; partnerLinks: PartnerLink[]; subsidies: SubsidyRecord[]; placeMetrics: PlaceMetric[] }
export type DomainResult<T> = { ok: true; value: T; valueId?: string } | { ok: false; error: { code: string; message: string } }
