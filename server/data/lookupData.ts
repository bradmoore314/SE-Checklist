// This file contains the standardized option lists for dropdown menus
// These are based on the "Drop Down List" sheet from the original spreadsheet

// Changed from doorTypes to quickConfigOptions
export const quickConfigOptions = [
  "Single Standard Door Exit Only Interior",
  "Single Mag Exit Only Perimeter",
  "Double Door Standard Exit Only Interior",
  "Double Door Mag Exit Only Perimeter",
  "Double Door Standard Both Sides Interior",
  "Double Door Mag Both Sides Perimeter",
  "Single Door Exit Only w/Card Reader Interior",
  "Single Door Exit Only w/Card Reader Perimeter",
  "Double Door Card Access One Side Interior",
  "Double Door Card Access One Side Perimeter",
  "Double Door Card Access Both Sides Interior",
  "Double Door Card Access Both Sides Perimeter"
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
  cameraTypes,
  mountingTypes,
  resolutions,
  elevatorTypes,
  turnstileTypes,
  intercomTypes
};
