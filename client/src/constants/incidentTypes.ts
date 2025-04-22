// Incident types organized by category
export const INCIDENT_TYPES = [
  // Criminal Activity Group
  { id: 'obviousCriminalAct', label: 'Obvious Criminal Act', category: 'Criminal Activity' },
  { id: 'activeBreakIn', label: 'Active Break-In', category: 'Criminal Activity' },
  { id: 'destructionOfProperty', label: 'Destruction of Property', category: 'Criminal Activity' },
  { id: 'carDrivingThroughGate', label: 'Car Driving Through Gate', category: 'Criminal Activity' },
  { id: 'carBurglaries', label: 'Car Burglaries', category: 'Criminal Activity' },
  { id: 'trespassing', label: 'Trespassing', category: 'Criminal Activity' },
  { id: 'carsBrokenIntoAfterFact', label: 'Cars Broken Into After Fact', category: 'Criminal Activity' },
  { id: 'brokenGlassWindows', label: 'Broken Glass/Windows', category: 'Criminal Activity' },
  
  // Suspicious Activity Group
  { id: 'suspiciousActivity', label: 'Suspicious Activity', category: 'Suspicious Activity' },
  { id: 'intentToCommitCriminalAct', label: 'Intent to Commit Criminal Act', category: 'Suspicious Activity' },
  { id: 'checkingMultipleCarDoors', label: 'Checking Multiple Car Doors', category: 'Suspicious Activity' },
  { id: 'dumpsterDivingOrDumping', label: 'Dumpster Diving/Dumping', category: 'Suspicious Activity' },
  
  // Nuisance Activity Group
  { id: 'urinationOrOtherBodilyFunctions', label: 'Urination or Other Bodily Functions', category: 'Nuisance Activity' },
  { id: 'presenceOfScooters', label: 'Presence of Scooters', category: 'Nuisance Activity' },
  { id: 'leavingTrash', label: 'Leaving Trash', category: 'Nuisance Activity' },
  
  // Emergency/Medical Group
  { id: 'emergencyServices', label: 'Emergency Services', category: 'Emergency/Medical' },
  { id: 'personInjuredOrDistress', label: 'Person Injured or in Distress', category: 'Emergency/Medical' },
  { id: 'obviousMedicalEmergency', label: 'Obvious Medical Emergency', category: 'Emergency/Medical' },
  { id: 'visibleFireOrSmoke', label: 'Visible Fire or Smoke', category: 'Emergency/Medical' },
  
  // Tenant Activity Group
  { id: 'tenantsMovingOut', label: 'Tenants Moving Out', category: 'Tenant Activity' },
  { id: 'largeItemsMovedAfterHours', label: 'Large Items Moved After Hours', category: 'Tenant Activity' },
  
  // Restricted Access Group
  { id: 'personInRestrictedArea', label: 'Person in Restricted Area', category: 'Restricted Access' },
  { id: 'sittingOrSleeping', label: 'Sitting or Sleeping', category: 'Restricted Access' },
  { id: 'presentInProhibitedArea', label: 'Present in Prohibited Area', category: 'Restricted Access' },
  
  // Loitering Group
  { id: 'loitering', label: 'Loitering', category: 'Loitering' },
  { id: 'activeGathering', label: 'Active Gathering', category: 'Loitering' },
  { id: 'groupsLoiteringGathering', label: 'Groups Loitering/Gathering', category: 'Loitering' },
  { id: 'homelessVagrant', label: 'Homeless/Vagrant', category: 'Loitering' },
  { id: 'sleepingOnSiteEncampments', label: 'Sleeping On-Site/Encampments', category: 'Loitering' },
  { id: 'loiteringInStairwells', label: 'Loitering in Stairwells', category: 'Loitering' },
  { id: 'personsSmoking', label: 'Persons Smoking', category: 'Loitering' },
  { id: 'vehicleLoiteringInArea', label: 'Vehicle Loitering in Area', category: 'Loitering' }
];