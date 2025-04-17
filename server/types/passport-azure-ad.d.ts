declare module 'passport-azure-ad' {
  import { Request } from 'express';
  
  export interface IOIDCStrategyOptionWithRequest {
    identityMetadata: string;
    clientID: string;
    responseType: string;
    responseMode: string;
    redirectUrl: string;
    allowHttpForRedirectUrl: boolean;
    clientSecret: string;
    validateIssuer: boolean;
    isB2C?: boolean;
    issuer?: string;
    passReqToCallback: boolean;
    scope: string[];
    loggingLevel: string;
    loggingNoPII: boolean;
    nonceLifetime?: number;
    nonceMaxAmount?: number;
    useCookieInsteadOfSession?: boolean;
    cookieEncryptionKeys?: Array<{ key: string; iv: string }>;
    clockSkew?: number;
  }

  export interface IBearerStrategyOption {
    identityMetadata: string;
    clientID: string;
    validateIssuer: boolean;
    issuer?: string;
    isB2C?: boolean;
    policyName?: string;
    passReqToCallback: boolean;
    scope?: string[];
    loggingLevel?: string;
    loggingNoPII?: boolean;
    clockSkew?: number;
  }
  
  export class BearerStrategy {
    constructor(options: IBearerStrategyOption, verify: Function);
    name: string;
  }
  
  export class OIDCStrategy {
    constructor(options: IOIDCStrategyOptionWithRequest, verify: Function);
    name: string;
  }
}