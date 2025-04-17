import { AccessPoint, Camera, Elevator, Intercom, Project } from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Configure the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Define the categories of questions from the project information file
export const projectQuestionCategories = {
  GENERAL_PROJECT_INFORMATION: "🏢 GENERAL PROJECT INFORMATION",
  SCOPE_OF_WORK: "🔧 SCOPE OF WORK",
  ELEVATOR_INTEGRATION: "🛗 ELEVATOR INTEGRATION",
  CHANGE_ORDERS_PRICING: "💵 CHANGE ORDERS & PRICING",
  INSTALLATION_LABOR: "🧑‍🔧 INSTALLATION & LABOR DETAILS",
  NETWORK_POWER: "🌐 NETWORK & POWER",
  SITE_SPECIFIC_CONSIDERATIONS: "📍 SITE-SPECIFIC CONSIDERATIONS",
  CLIENT_COMMUNICATION: "🧠 CLIENT COMMUNICATION & STRATEGY",
  FOLLOW_UPS: "📞 FOLLOW-UPS & TURNOVER",
  FINAL_WRAP_UP: "✅ FINAL WRAP-UP",
};

// Define the structure of a question
export interface ProjectQuestion {
  id: string;
  question: string;
  category: string;
  canBeAnswered: boolean;
  answerSource: string; // 'existing_field', 'derived', 'new_field', 'conversational'
  fieldPath?: string; // Where in the schema this can be found (if applicable)
  options?: string[]; // For questions with predefined options
  additionalNotes?: string; // Any additional notes about this question
}

// Define all questions from the project information file
export const projectQuestions: ProjectQuestion[] = [
  // GENERAL PROJECT INFORMATION
  {
    id: "gen1",
    question: "Is this an existing client or a new client?",
    category: projectQuestionCategories.GENERAL_PROJECT_INFORMATION,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Existing", "New"],
    additionalNotes: "Current schema doesn't track client history, we need to add a field."
  },
  {
    id: "gen2",
    question: "What type of client is it?",
    category: projectQuestionCategories.GENERAL_PROJECT_INFORMATION,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["CRE", "MF"],
    additionalNotes: "We should add a client_type field to the Project schema."
  },
  {
    id: "gen3",
    question: "Is this for an entire building or a tenant space?",
    category: projectQuestionCategories.GENERAL_PROJECT_INFORMATION,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Building", "Tenant"],
    additionalNotes: "We should add an installation_scope field."
  },
  {
    id: "gen4",
    question: "Is this a new installation or a takeover of an existing system?",
    category: projectQuestionCategories.GENERAL_PROJECT_INFORMATION,
    canBeAnswered: true,
    answerSource: "existing_field",
    fieldPath: "projects.takeover",
    additionalNotes: "The Project schema already has a takeover boolean field."
  },
  {
    id: "gen5",
    question: "If new, what type of construction is it?",
    category: projectQuestionCategories.GENERAL_PROJECT_INFORMATION,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Ground-Up", "Build-Out", "Finished"],
    additionalNotes: "We should add a construction_type field to the Project schema."
  },
  {
    id: "gen6",
    question: "Is this a new location or a system addition?",
    category: projectQuestionCategories.GENERAL_PROJECT_INFORMATION,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["New", "Addition"],
    additionalNotes: "We don't currently track if this is an addition to existing systems."
  },
  {
    id: "gen7",
    question: "What systems are included?",
    category: projectQuestionCategories.GENERAL_PROJECT_INFORMATION,
    canBeAnswered: true,
    answerSource: "derived",
    additionalNotes: "This can be derived by checking if access points, cameras, or both exist in the project."
  },
  {
    id: "gen8",
    question: "What is the building name and address?",
    category: projectQuestionCategories.GENERAL_PROJECT_INFORMATION,
    canBeAnswered: true,
    answerSource: "existing_field",
    fieldPath: "projects.name, projects.site_address",
    additionalNotes: "These fields already exist in the Project schema."
  },
  {
    id: "gen9",
    question: "What is the installation timeline or deadline?",
    category: projectQuestionCategories.GENERAL_PROJECT_INFORMATION,
    canBeAnswered: false,
    answerSource: "new_field",
    additionalNotes: "We need to add an installation_deadline field to the Project schema."
  },
  {
    id: "gen10",
    question: "Is the client sensitive to deadlines or expectations?",
    category: projectQuestionCategories.GENERAL_PROJECT_INFORMATION,
    canBeAnswered: false,
    answerSource: "conversational",
    additionalNotes: "This is subjective and should be discussed during a meeting."
  },
  {
    id: "gen11",
    question: "Are we adding to an existing system or starting fresh?",
    category: projectQuestionCategories.GENERAL_PROJECT_INFORMATION,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["New", "Existing"],
    additionalNotes: "Similar to gen6, we need a field to track if this is an addition."
  },
  {
    id: "gen12",
    question: "What are the customer's expectations regarding labor and power supply?",
    category: projectQuestionCategories.GENERAL_PROJECT_INFORMATION,
    canBeAnswered: false,
    answerSource: "conversational",
    additionalNotes: "This is too detailed and contextual for a fixed field; better suited for notes."
  },
  
  // SCOPE OF WORK
  {
    id: "scope1",
    question: "What hardware is being installed or replaced?",
    category: projectQuestionCategories.SCOPE_OF_WORK,
    canBeAnswered: true,
    answerSource: "derived",
    additionalNotes: "This can be derived from the specific equipment entries (access points, cameras, etc.)."
  },
  {
    id: "scope2",
    question: "Are we reusing existing systems (e.g., DoorKing, Honeywell)?",
    category: projectQuestionCategories.SCOPE_OF_WORK,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Yes", "No"],
    additionalNotes: "We need to add a field to track reused systems."
  },
  {
    id: "scope3",
    question: "What reader/lock models are being used?",
    category: projectQuestionCategories.SCOPE_OF_WORK,
    canBeAnswered: true,
    answerSource: "existing_field",
    fieldPath: "accessPoints.reader_type, accessPoints.lock_type",
    additionalNotes: "These fields already exist in the AccessPoint schema."
  },
  {
    id: "scope4",
    question: "Are credentials needed (fobs, tags, BLE/NFC)?",
    category: projectQuestionCategories.SCOPE_OF_WORK,
    canBeAnswered: true,
    answerSource: "existing_field",
    fieldPath: "projects.need_credentials, projects.ble",
    additionalNotes: "We have need_credentials and ble fields in the Project schema."
  },
  {
    id: "scope5",
    question: "How many credentials are required?",
    category: projectQuestionCategories.SCOPE_OF_WORK,
    canBeAnswered: false,
    answerSource: "new_field",
    additionalNotes: "We need to add a credential_count field to the Project schema."
  },
  {
    id: "scope6",
    question: "Who is providing the locks?",
    category: projectQuestionCategories.SCOPE_OF_WORK,
    canBeAnswered: true,
    answerSource: "existing_field",
    fieldPath: "accessPoints.lock_provider",
    additionalNotes: "The lock_provider field exists in the AccessPoint schema."
  },
  {
    id: "scope7",
    question: "What system layout is being used?",
    category: projectQuestionCategories.SCOPE_OF_WORK,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Head-End Boards", "Bus Run Above Doors"],
    additionalNotes: "We need to add a system_layout field to the Project schema."
  },
  {
    id: "scope8",
    question: "How many head-end locations are there?",
    category: projectQuestionCategories.SCOPE_OF_WORK,
    canBeAnswered: false,
    answerSource: "new_field",
    additionalNotes: "We need to add a head_end_count field to the Project schema."
  },
  {
    id: "scope9",
    question: "Is conduit needed? Who is installing it?",
    category: projectQuestionCategories.SCOPE_OF_WORK,
    canBeAnswered: false,
    answerSource: "conversational",
    additionalNotes: "This requires detailed discussion; should be part of notes."
  },
  {
    id: "scope10",
    question: "Is network being provided by the customer?",
    category: projectQuestionCategories.SCOPE_OF_WORK,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Yes", "No"],
    additionalNotes: "We need to add a customer_network field to the Project schema."
  },
  {
    id: "scope11",
    question: "Is power existing at each head-end location?",
    category: projectQuestionCategories.SCOPE_OF_WORK,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Existing", "Needed"],
    additionalNotes: "We need to add a head_end_power field to the Project schema."
  },
  {
    id: "scope12",
    question: "How is lock power being managed?",
    category: projectQuestionCategories.SCOPE_OF_WORK,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Altronix", "Other"],
    additionalNotes: "We need to add a lock_power_management field to the Project schema."
  },
  {
    id: "scope13",
    question: "Are fire relays required?",
    category: projectQuestionCategories.SCOPE_OF_WORK,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Yes", "No"],
    additionalNotes: "We need to add a fire_relays_required field to the Project schema."
  },
  {
    id: "scope14",
    question: "Are crash bars or auto door openers included?",
    category: projectQuestionCategories.SCOPE_OF_WORK,
    canBeAnswered: true,
    answerSource: "existing_field",
    fieldPath: "accessPoints.crashbars",
    additionalNotes: "We already have a crashbars field in the AccessPoint schema."
  },
  {
    id: "scope15",
    question: "Are intercoms or KFO in scope?",
    category: projectQuestionCategories.SCOPE_OF_WORK,
    canBeAnswered: true,
    answerSource: "derived",
    additionalNotes: "This can be derived by checking if there are any intercoms associated with the project."
  },
  {
    id: "scope16",
    question: "Are there any devices that need external enclosures (e.g., Hoffman boxes)?",
    category: projectQuestionCategories.SCOPE_OF_WORK,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Yes", "No"],
    additionalNotes: "We need to add an external_enclosures field to the Project schema."
  },
  {
    id: "scope17",
    question: "Are media converters or point-to-point devices needed?",
    category: projectQuestionCategories.SCOPE_OF_WORK,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Yes", "No"],
    additionalNotes: "We need to add a media_converters field to the Project schema."
  },
  {
    id: "scope18",
    question: "Are the readers surface-mounted or panel-integrated?",
    category: projectQuestionCategories.SCOPE_OF_WORK,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Surface", "Swing Panel"],
    additionalNotes: "We should add a reader_mounting_type field to the AccessPoint schema."
  },
  {
    id: "scope19",
    question: "Do we need junction boxes or additional wiring infrastructure?",
    category: projectQuestionCategories.SCOPE_OF_WORK,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Yes", "No"],
    additionalNotes: "We need to add fields for junction_boxes and wiring_infrastructure."
  },
  {
    id: "scope20",
    question: "Are any site-specific wiring upgrades required?",
    category: projectQuestionCategories.SCOPE_OF_WORK,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Existing", "Upgrades"],
    additionalNotes: "We need to add a wiring_upgrades field to the Project schema."
  },
  
  // ELEVATOR INTEGRATION
  {
    id: "elev1",
    question: "What type of elevator access is being installed?",
    category: projectQuestionCategories.ELEVATOR_INTEGRATION,
    canBeAnswered: true,
    answerSource: "existing_field",
    fieldPath: "elevators.elevator_type",
    additionalNotes: "This field already exists in the Elevator schema."
  },
  {
    id: "elev2",
    question: "Are elevator companies involved in their portion of work?",
    category: projectQuestionCategories.ELEVATOR_INTEGRATION,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Yes", "No"],
    additionalNotes: "We need to add an elevator_company_involved field to the Elevator schema."
  },
  {
    id: "elev3",
    question: "How many elevator banks and cars are there?",
    category: projectQuestionCategories.ELEVATOR_INTEGRATION,
    canBeAnswered: true,
    answerSource: "derived",
    fieldPath: "elevators (count), elevators.bank_name",
    additionalNotes: "We can derive this by counting elevators and grouping by bank_name."
  },
  {
    id: "elev4",
    question: "Are all elevator cabs serving the same floors? Any basement or rear door variations?",
    category: projectQuestionCategories.ELEVATOR_INTEGRATION,
    canBeAnswered: false,
    answerSource: "conversational",
    additionalNotes: "This is too detailed for a standard field; should be discussed in meetings."
  },
  {
    id: "elev5",
    question: "Are the readers BLE-compatible?",
    category: projectQuestionCategories.ELEVATOR_INTEGRATION,
    canBeAnswered: true,
    answerSource: "existing_field",
    fieldPath: "projects.ble",
    additionalNotes: "The ble field in the Project schema indicates BLE compatibility."
  },
  {
    id: "elev6",
    question: "Are enclosures needed in the elevator machine room?",
    category: projectQuestionCategories.ELEVATOR_INTEGRATION,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Yes", "No"],
    additionalNotes: "We need to add an elevator_room_enclosures field to the Elevator schema."
  },
  {
    id: "elev7",
    question: "Is there elevator access control integration needed?",
    category: projectQuestionCategories.ELEVATOR_INTEGRATION,
    canBeAnswered: true,
    answerSource: "derived",
    additionalNotes: "This can be derived from the presence of elevators in the project."
  },
  
  // CHANGE ORDERS & PRICING
  {
    id: "change1",
    question: "What change orders are being reviewed?",
    category: projectQuestionCategories.CHANGE_ORDERS_PRICING,
    canBeAnswered: false,
    answerSource: "conversational",
    additionalNotes: "Change orders are situational and should be discussed during meetings."
  },
  {
    id: "change2",
    question: "What hardware is changing (add/remove/modify)?",
    category: projectQuestionCategories.CHANGE_ORDERS_PRICING,
    canBeAnswered: false,
    answerSource: "conversational",
    additionalNotes: "Change order details are situational and should be discussed during meetings."
  },
  {
    id: "change3",
    question: "Is labor included for the change order?",
    category: projectQuestionCategories.CHANGE_ORDERS_PRICING,
    canBeAnswered: false,
    answerSource: "conversational",
    options: ["Yes", "No"],
    additionalNotes: "This is specific to each change order and requires discussion."
  },
  {
    id: "change4",
    question: "How does the change impact cost?",
    category: projectQuestionCategories.CHANGE_ORDERS_PRICING,
    canBeAnswered: false,
    answerSource: "conversational",
    additionalNotes: "Cost impacts are specific to each change order and require discussion."
  },
  {
    id: "change5",
    question: "Are hardware models clearly specified?",
    category: projectQuestionCategories.CHANGE_ORDERS_PRICING,
    canBeAnswered: false,
    answerSource: "conversational",
    options: ["Yes", "No"],
    additionalNotes: "This requires a review of specifications during meetings."
  },
  {
    id: "change6",
    question: "Is pricing aligned with customer expectations?",
    category: projectQuestionCategories.CHANGE_ORDERS_PRICING,
    canBeAnswered: false,
    answerSource: "conversational",
    options: ["Yes", "No"],
    additionalNotes: "This is subjective and requires customer feedback during meetings."
  },
  {
    id: "change7",
    question: "Is price protection language included?",
    category: projectQuestionCategories.CHANGE_ORDERS_PRICING,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Yes", "No"],
    additionalNotes: "We should add a price_protection field to the Project schema."
  },
  {
    id: "change8",
    question: "Do quotes need to be rebuilt?",
    category: projectQuestionCategories.CHANGE_ORDERS_PRICING,
    canBeAnswered: false,
    answerSource: "conversational",
    options: ["Yes", "No"],
    additionalNotes: "This is situational and should be discussed during meetings."
  },
  {
    id: "change9",
    question: "Are there new RMR opportunities?",
    category: projectQuestionCategories.CHANGE_ORDERS_PRICING,
    canBeAnswered: false,
    answerSource: "conversational",
    options: ["Yes", "No"],
    additionalNotes: "This requires strategic discussion during meetings."
  },
  
  // INSTALLATION & LABOR DETAILS
  {
    id: "labor1",
    question: "Is this project local or remote?",
    category: projectQuestionCategories.INSTALLATION_LABOR,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Local", "Remote"],
    additionalNotes: "We need to add a project_location_type field to the Project schema."
  },
  {
    id: "labor2",
    question: "Who is performing the work?",
    category: projectQuestionCategories.INSTALLATION_LABOR,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Kastle Tech", "Partner"],
    additionalNotes: "We need to add a work_performer field to the Project schema."
  },
  {
    id: "labor3",
    question: "What are the total labor hours quoted?",
    category: projectQuestionCategories.INSTALLATION_LABOR,
    canBeAnswered: false,
    answerSource: "new_field",
    additionalNotes: "We need to add a total_labor_hours field to the Project schema."
  },
  {
    id: "labor4",
    question: "Has labor been adjusted for any scope reductions?",
    category: projectQuestionCategories.INSTALLATION_LABOR,
    canBeAnswered: false,
    answerSource: "conversational",
    options: ["Yes", "No"],
    additionalNotes: "This is situational and should be discussed during meetings."
  },
  {
    id: "labor5",
    question: "Is subcontractor labor accounted for?",
    category: projectQuestionCategories.INSTALLATION_LABOR,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Yes", "No"],
    additionalNotes: "We need to add a subcontractor_labor field to the Project schema."
  },
  {
    id: "labor6",
    question: "Who is commissioning the locks?",
    category: projectQuestionCategories.INSTALLATION_LABOR,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Kastle", "Subcontractor"],
    additionalNotes: "We need to add a lock_commissioning field to the Project schema."
  },
  {
    id: "labor7",
    question: "Has labor been reviewed for accuracy?",
    category: projectQuestionCategories.INSTALLATION_LABOR,
    canBeAnswered: false,
    answerSource: "conversational",
    options: ["Yes", "No"],
    additionalNotes: "This requires discussion and review during meetings."
  },
  
  // NETWORK & POWER
  {
    id: "network1",
    question: "Is the customer providing the network?",
    category: projectQuestionCategories.NETWORK_POWER,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Yes", "No"],
    additionalNotes: "Same as scope10 - we need a customer_network field."
  },
  {
    id: "network2",
    question: "Are all head-ends on the same VLAN/Subnet?",
    category: projectQuestionCategories.NETWORK_POWER,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Yes", "No"],
    additionalNotes: "We need to add a same_subnet field to the Project schema."
  },
  {
    id: "network3",
    question: "Is power existing at head-ends?",
    category: projectQuestionCategories.NETWORK_POWER,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Existing", "Needed"],
    additionalNotes: "Same as scope11 - we need a head_end_power field."
  },
  {
    id: "network4",
    question: "Are fire relays required and where?",
    category: projectQuestionCategories.NETWORK_POWER,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Yes", "No"],
    additionalNotes: "Same as scope13 - we need a fire_relays_required field."
  },
  {
    id: "network5",
    question: "Will the network in the elevator machine room match the rest of the system?",
    category: projectQuestionCategories.NETWORK_POWER,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Yes", "No"],
    additionalNotes: "We need to add an elevator_room_network_match field to the Project schema."
  },
  
  // SITE-SPECIFIC CONSIDERATIONS
  {
    id: "site1",
    question: "Are there contact-only doors? What's their function?",
    category: projectQuestionCategories.SITE_SPECIFIC_CONSIDERATIONS,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Yes", "No"],
    additionalNotes: "We need to add a contact_only_doors field to the Project schema."
  },
  {
    id: "site2",
    question: "What is the condition of existing infrastructure?",
    category: projectQuestionCategories.SITE_SPECIFIC_CONSIDERATIONS,
    canBeAnswered: false,
    answerSource: "new_field",
    additionalNotes: "We need to add an infrastructure_condition field to the Project schema."
  },
  {
    id: "site3",
    question: "Are relays, conduit, or new wiring needed?",
    category: projectQuestionCategories.SITE_SPECIFIC_CONSIDERATIONS,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Yes", "No"],
    additionalNotes: "This overlaps with previous questions on conduit and wiring."
  },
  {
    id: "site4",
    question: "Are there auto-openers or crash bars?",
    category: projectQuestionCategories.SITE_SPECIFIC_CONSIDERATIONS,
    canBeAnswered: true,
    answerSource: "existing_field",
    fieldPath: "accessPoints.crashbars",
    additionalNotes: "Same as scope14 - we have a crashbars field in the AccessPoint schema."
  },
  {
    id: "site5",
    question: "Do we need to engage other trades/vendors?",
    category: projectQuestionCategories.SITE_SPECIFIC_CONSIDERATIONS,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Yes", "No"],
    additionalNotes: "We need to add an other_vendors_needed field to the Project schema."
  },
  {
    id: "site6",
    question: "Are site-specific exclusions documented?",
    category: projectQuestionCategories.SITE_SPECIFIC_CONSIDERATIONS,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Yes", "No"],
    additionalNotes: "We need to add a site_exclusions_documented field to the Project schema."
  },
  {
    id: "site7",
    question: "Are there caveats or risks called out in the proposal?",
    category: projectQuestionCategories.SITE_SPECIFIC_CONSIDERATIONS,
    canBeAnswered: false,
    answerSource: "new_field",
    options: ["Yes", "No"],
    additionalNotes: "We need to add a proposal_risks_documented field to the Project schema."
  },
  
  // CLIENT COMMUNICATION & STRATEGY
  {
    id: "client1",
    question: "Has the client requested special features like image display, visitor management?",
    category: projectQuestionCategories.CLIENT_COMMUNICATION,
    canBeAnswered: true,
    answerSource: "existing_field",
    fieldPath: "projects.visitor",
    additionalNotes: "We have a visitor field in the Project schema, but should add more special features."
  },
  {
    id: "client2",
    question: "Do they understand their role in device programming?",
    category: projectQuestionCategories.CLIENT_COMMUNICATION,
    canBeAnswered: false,
    answerSource: "conversational",
    options: ["Yes", "No"],
    additionalNotes: "This requires direct client communication during meetings."
  },
  {
    id: "client3",
    question: "Are there objections to subscriptions or RMR?",
    category: projectQuestionCategories.CLIENT_COMMUNICATION,
    canBeAnswered: false,
    answerSource: "conversational",
    options: ["Yes", "No"],
    additionalNotes: "This requires direct client communication during meetings."
  },
  {
    id: "client4",
    question: "Are other vendor solutions being considered?",
    category: projectQuestionCategories.CLIENT_COMMUNICATION,
    canBeAnswered: false,
    answerSource: "conversational",
    options: ["Yes", "No"],
    additionalNotes: "This requires direct client communication during meetings."
  },
  
  // FOLLOW-UPS & TURNOVER
  {
    id: "follow1",
    question: "What are the next steps to finalize the quote?",
    category: projectQuestionCategories.FOLLOW_UPS,
    canBeAnswered: false,
    answerSource: "conversational",
    additionalNotes: "This requires strategic planning during meetings."
  },
  {
    id: "follow2",
    question: "Are there outstanding approvals?",
    category: projectQuestionCategories.FOLLOW_UPS,
    canBeAnswered: false,
    answerSource: "conversational",
    options: ["Yes", "No"],
    additionalNotes: "This requires tracking in meetings."
  },
  {
    id: "follow3",
    question: "Are additional review calls needed?",
    category: projectQuestionCategories.FOLLOW_UPS,
    canBeAnswered: false,
    answerSource: "conversational",
    options: ["Yes", "No"],
    additionalNotes: "This requires planning during meetings."
  },
  {
    id: "follow4",
    question: "Who is responsible for next actions?",
    category: projectQuestionCategories.FOLLOW_UPS,
    canBeAnswered: false,
    answerSource: "conversational",
    additionalNotes: "This requires assignment during meetings."
  },
  
  // FINAL WRAP-UP
  {
    id: "final1",
    question: "Are all scope, labor, and pricing items resolved?",
    category: projectQuestionCategories.FINAL_WRAP_UP,
    canBeAnswered: false,
    answerSource: "conversational",
    options: ["Yes", "No"],
    additionalNotes: "This requires verification during meetings."
  },
  {
    id: "final2",
    question: "What exclusions/caveats need to be documented?",
    category: projectQuestionCategories.FINAL_WRAP_UP,
    canBeAnswered: false,
    answerSource: "conversational",
    additionalNotes: "This requires documentation during meetings."
  },
  {
    id: "final3",
    question: "Are there any unresolved risks or questions?",
    category: projectQuestionCategories.FINAL_WRAP_UP,
    canBeAnswered: false,
    answerSource: "conversational",
    options: ["Yes", "No"],
    additionalNotes: "This requires review during meetings."
  },
];

// Helper function to count answerable questions
export function getAnswerableQuestionsCount(): { answerable: number, total: number } {
  const answerable = projectQuestions.filter(q => q.canBeAnswered).length;
  return {
    answerable,
    total: projectQuestions.length
  };
}

// Helper function to get questions by category
export function getQuestionsByCategory(category: string): ProjectQuestion[] {
  return projectQuestions.filter(q => q.category === category);
}

// Helper function to get questions by answerSource
export function getQuestionsByAnswerSource(source: string): ProjectQuestion[] {
  return projectQuestions.filter(q => q.answerSource === source);
}

// Function to analyze a project and determine which questions can be answered
export async function analyzeProject(project: Project, 
                                    accessPoints: AccessPoint[],
                                    cameras: Camera[],
                                    elevators: Elevator[],
                                    intercoms: Intercom[]): Promise<{ 
                                      answeredQuestions: ProjectQuestion[],
                                      unansweredQuestions: ProjectQuestion[],
                                      aiSummary: string
                                    }> {
  // Create a deep copy of the questions so we don't modify the original
  const questions = JSON.parse(JSON.stringify(projectQuestions)) as ProjectQuestion[];
  
  // Here we would implement the logic to check each question against the project data
  // For now, we'll just use the predefined canBeAnswered property
  
  const answeredQuestions = questions.filter(q => q.canBeAnswered);
  const unansweredQuestions = questions.filter(q => !q.canBeAnswered);
  
  // Generate AI summary using Gemini API
  const aiSummary = await generateAiSummary(project, answeredQuestions, unansweredQuestions);
  
  return {
    answeredQuestions,
    unansweredQuestions,
    aiSummary
  };
}

// Function to generate summary from Gemini
async function generateAiSummary(
  project: Project,
  answeredQuestions: ProjectQuestion[],
  unansweredQuestions: ProjectQuestion[]
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Format the project information and questions for the AI prompt
    const projectInfo = JSON.stringify(project, null, 2);
    const answeredQuestionsInfo = answeredQuestions.map(q => 
      `Question: ${q.question} (${q.category}) [CAN ANSWER with ${q.answerSource}]`
    ).join('\n');
    const unansweredQuestionsInfo = unansweredQuestions.map(q => 
      `Question: ${q.question} (${q.category}) [CANNOT ANSWER - needs ${q.answerSource}]`
    ).join('\n');
    
    // Create an informative prompt for the AI
    const prompt = `
    You are a security system project analyst. I need you to analyze this site walk project and provide two summaries:
    
    1. A Quote Review Summary - analyzing which questions we can answer based on existing data and what new information we need to gather.
    2. A Turnover Call Summary - creating an agenda for a turnover call that prioritizes gathering missing information.
    
    Here is the project information:
    ${projectInfo}
    
    Questions that CAN be answered with existing data:
    ${answeredQuestionsInfo}
    
    Questions that CANNOT be answered with existing data:
    ${unansweredQuestionsInfo}
    
    For the Quote Review Summary:
    1. Provide a concise summary of what we know about the project
    2. Identify the top 5 most critical questions we CAN answer
    3. Identify the top 5 most critical questions we CANNOT answer and need to gather information for
    
    For the Turnover Call Summary:
    1. Create an agenda with items to discuss
    2. Prioritize the most critical unanswered questions
    3. Group related questions together for efficient discussion
    
    Make the summaries clear, concise, and actionable.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Error generating AI summary:", error);
    return "Unable to generate AI summary. Please check your API key and try again.";
  }
}

// Function to generate fields needed for new schema
export function generateNewFieldsNeeded(): { fieldName: string, fieldType: string, parentSchema: string }[] {
  const newFields: { fieldName: string, fieldType: string, parentSchema: string }[] = [];
  
  // Get all questions that need new fields
  const newFieldQuestions = projectQuestions.filter(q => q.answerSource === "new_field");
  
  // Extract field requirements from the notes
  newFieldQuestions.forEach(question => {
    const match = question.additionalNotes?.match(/need to add an? ([a-z_]+) field/i);
    if (match && match[1]) {
      const fieldName = match[1];
      
      // Determine parent schema based on the category or specific notes
      let parentSchema = "Project";
      if (question.category === projectQuestionCategories.ELEVATOR_INTEGRATION) {
        parentSchema = "Elevator";
      } else if (question.additionalNotes?.includes("AccessPoint")) {
        parentSchema = "AccessPoint";
      }
      
      // Determine field type based on options
      const fieldType = question.options ? 
        (question.options.length === 2 && question.options.includes("Yes") && question.options.includes("No") ? 
          "boolean" : "enum") : 
        "string";
      
      // Add to the list of new fields
      newFields.push({
        fieldName,
        fieldType,
        parentSchema
      });
    }
  });
  
  return newFields;
}

// Main analysis function to be exported
export function generateProjectAnalysis(): {
  answerableQuestions: number,
  totalQuestions: number,
  newFieldsNeeded: { fieldName: string, fieldType: string, parentSchema: string }[],
  questionsByCategory: Record<string, ProjectQuestion[]>,
} {
  const { answerable, total } = getAnswerableQuestionsCount();
  const newFieldsNeeded = generateNewFieldsNeeded();
  
  // Create an object with questions grouped by category
  const questionsByCategory: Record<string, ProjectQuestion[]> = {};
  Object.values(projectQuestionCategories).forEach(category => {
    questionsByCategory[category] = getQuestionsByCategory(category);
  });
  
  return {
    answerableQuestions: answerable,
    totalQuestions: total,
    newFieldsNeeded,
    questionsByCategory,
  };
}