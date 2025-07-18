// types/navigationTypes.ts

// Define the structure of your root navigation stack.
// This is used by React Navigation to type check route names and their params.

// types/navigationTypes.ts

// Defines the route names and expected parameters for your navigators
// Used for type safety across useNavigation and navigation props

export type RootStackParamList = {
  AuthNavigator: undefined;       // Navigator for unauthenticated screens
  PostAuthTabs: undefined;        // Navigator for logged-in users
  TeamTabs: { teamId: number };   // Team-specific features
  
  Landing: undefined; // Initial landing screen for unauthenticated users
  Login: undefined;               // Optional direct access to Login screen
  Register: undefined;            // Optional direct access to Register screen
  PlayerDetail: { playerId: number }; // Screen to view player details
};

export type PostAuthTabsParamList = {
  TeamSetup: undefined;          // Screen to create or join teams
  ActiveClubs: undefined;        // Displays user’s current teams
  AccountSettings: undefined;    // New tab for logging out and managing account
};

// Team-specific tab navigator
export type TeamTabsParamList = {
  Dashboard: undefined;
  Players: undefined;
  MatchCenter: undefined;
  GrowthInsights: undefined;
  TeamAnalysis: undefined;
};

