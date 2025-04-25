// This file contains the standardized option lists for dropdown menus
// These are based on the "Drop Down List" sheet from the original spreadsheet

// Changed from doorTypes to quickConfigOptions
export const quickConfigOptions = [
  "Takeover Prop Monitoring Single Standard Interior Kastle",
  "Takeover Prop Monitoring Single Mag Interior Kastle",
  "Takeover Prop Monitoring Double Mag Interior Kastle",
  "Takeover Prop Monitoring Single Standard Perimeter Kastle",
  "Takeover Prop Monitoring Single Mag Perimeter Kastle",
  "Takeover Prop Monitoring Double Mag Perimeter Kastle",
  "Takeover Prop Monitoring Single Delayed Egress Perimeter Kastle",
  "Takeover Prop Monitoring Double Delayed Egress Perimeter Kastle",
  "Takeover Prop Monitoring Single Delayed Egress Interior Kastle",
  "Takeover Prop Monitoring Double Delayed Egress Interior Kastle",
  "New Prop Monitoring Single Mag Interior Installed/Existing",
  "New Prop Monitoring Single Mag Interior Installed/Existing Suite",
  "New Prop Monitoring Double Mag Interior Installed/Existing",
  "New Prop Monitoring Double Mag Interior Installed/Existing Suite",
  "New Prop Monitoring Single Standard Interior Installed/Existing",
  "New Prop Monitoring Single Standard Interior Installed/Existing Suite",
  "New Prop Monitoring Double Mag Perimeter Kastle",
  "New Prop Monitoring Double Delayed Egress Perimeter Kastle",
  "New Prop Monitoring Single Standard Interior Kastle",
  "New Prop Monitoring Single Standard Interior Kastle Suite",
  "New Prop Monitoring Single Mag Interior Kastle",
  "New Prop Monitoring Single Mag Interior Kastle Suite",
  "New Prop Monitoring Double Mag Interior Kastle",
  "New Prop Monitoring Double Mag Interior Kastle Suite",
  "New Prop Monitoring Single Delayed Egress Interior Kastle",
  "New Prop Monitoring Double Delayed Egress Interior Kastle",
  "New Prop Monitoring Double Delayed Egress Interior Kastle Suite",
  "New Prop Monitoring Single Mag Perimeter Installed/Existing",
  "New Prop Monitoring Double Mag Perimeter Installed/Existing",
  "New Prop Monitoring Single Standard Perimeter Installed/Existing",
  "New Prop Monitoring Single Standard Perimeter Kastle",
  "New Prop Monitoring Single Mag Perimeter Kastle",
  "New Prop Monitoring Single Delayed Egress Perimeter Kastle",
  "New Prop Monitoring Single Delayed Egress Interior Kastle Suite",
  "New Prop Monitoring Single Mag Interior Installed/Existing BMF",
  "New Prop Monitoring Double Mag Interior Installed/Existing BMF",
  "New Prop Monitoring Single Standard Interior Installed/Existing BMF",
  "New Prop Monitoring Single Standard Interior Kastle BMF",
  "New Prop Monitoring Single Mag Interior Kastle BMF",
  "New Prop Monitoring Double Mag Interior Kastle BMF",
  "New Prop Monitoring Single Delayed Egress Interior Kastle BMF",
  "New Prop Monitoring Double Delayed Egress Interior Kastle BMF",
  "Takeover Prop Monitoring Single Delayed Egress Interior Kastle Suite",
  "Takeover Prop Monitoring Double Delayed Egress Interior Kastle Suite"
];

export const readerTypes = [
  "KR-100",
  "AIO",
  "AIO Mullion",
  "RP40 W/Keypad",
  "RP40",
  "RPK40",
  "CSR-35L",
  "KP-11",
  "KP-12"
];

// Updated lock types as requested
export const lockTypes = [
  "Standard",
  "Single Mag",
  "Double Mag",
  "Single Delayed Egress",
  "Double Delayed Egress",
  "No Lock"
];

// Changed from securityLevels to monitoringTypes
export const monitoringTypes = [
  "Prop",
  "Alarmed",
  "Card Read Only"
];

// Changed from ppiOptions to lockProviderOptions
export const lockProviderOptions = [
  "Kastle",
  "Existing"
];

// New options for takeover
export const takeoverOptions = [
  "Yes",
  "No"
];

// New options for interior/perimeter
export const interiorPerimeterOptions = [
  "Interior",
  "Perimeter"
];

export const yesNoOptions = [
  "Yes",
  "No",
  "Combo"
];

export const cameraTypes = [
  "Dome Indoor",
  "Dome Outdoor",
  "Bullet Indoor",
  "Bullet Outdoor",
  "PTZ Indoor",
  "PTZ Outdoor",
  "Fisheye",
  "Panoramic"
];

export const mountingTypes = [
  "Ceiling",
  "Wall",
  "Corner",
  "Pole",
  "Pendant"
];

export const resolutions = [
  "1.3MP",
  "2MP",
  "3MP",
  "4MP",
  "5MP",
  "8MP",
  "12MP"
];

export const elevatorTypes = [
  "Standard",
  "High-Speed",
  "Freight",
  "Destination Dispatch"
];

export const turnstileTypes = [
  "Tripod",
  "Full-Height",
  "Optical",
  "Speed Gate"
];

export const intercomTypes = [
  "IP Video",
  "IP Audio",
  "Analog Video",
  "Analog Audio"
];

// Define options for the Noisy Prop field
export const noisyPropOptions = [
  "Yes",
  "No"
];

// Define options for the Crashbars field
export const crashbarsOptions = [
  "Yes",
  "No"
];

// Define options for the Real Lock Type field
export const realLockTypeOptions = [
  "Mortise",
  "Single Strike"
];

// Define tooltips for AI processing
export const tooltips = {
  replace_readers: "Installation/Hardware Scope: Existing readers are being swapped out. Consider compatibility with existing wiring and backboxes.",
  install_locks: "Installation/Hardware Scope: New locks are being installed as part of the project.",
  pull_wire: "Installation/Hardware Scope: New wiring is required for some or all devices.",
  wireless_locks: "Installation/Hardware Scope: Project includes wireless locks that communicate via gateway.",
  conduit_drawings: "Installation/Hardware Scope: Project requires identification of conduit pathways.",
  interior_access_points: "Access points located inside the building, typically controlling access between interior spaces.",
  perimeter_access_points: "Access points located at building entrances or perimeter, controlling access from outside.",
  indoor_cameras: "Cameras designed for indoor use with appropriate resolution and features.",
  outdoor_cameras: "Cameras designed to withstand outdoor conditions with weatherproofing and appropriate features.",
  elevator_control: "Systems that integrate with elevators to control floor access based on credentials.",
  intercom_systems: "Communication devices at entry points that allow visitors to contact occupants for access."
};

// Export all lookup data as a single object
export const lookupData = {
  // Include both new names and backward compatible names
  quickConfigOptions,
  doorTypes: quickConfigOptions, // For backward compatibility
  readerTypes,
  lockTypes,
  monitoringTypes,
  securityLevels: monitoringTypes, // For backward compatibility
  lockProviderOptions,
  ppiOptions: lockProviderOptions, // For backward compatibility
  takeoverOptions,
  interiorPerimeterOptions,
  yesNoOptions,
  noisyPropOptions,
  crashbarsOptions,
  realLockTypeOptions,
  cameraTypes,
  mountingTypes,
  resolutions,
  elevatorTypes,
  turnstileTypes,
  intercomTypes,
  tooltips // Add tooltips to the lookup data
};
