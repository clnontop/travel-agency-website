// Phone Number Validation Service
// Validates phone numbers using multiple methods including carrier lookup

interface PhoneValidationResult {
  isValid: boolean;
  formatted: string;
  country: string;
  carrier?: string;
  lineType?: string;
  isActive?: boolean;
  confidence: number;
}

interface CarrierInfo {
  name: string;
  country: string;
  mcc: string; // Mobile Country Code
  mnc: string; // Mobile Network Code
}

class PhoneValidationService {
  private readonly INDIAN_CARRIERS = [
    { name: 'Airtel', prefixes: ['70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99'] },
    { name: 'Jio', prefixes: ['60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89'] },
    { name: 'Vi (Vodafone Idea)', prefixes: ['70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99'] },
    { name: 'BSNL', prefixes: ['60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '94', '95', '96', '97', '98', '99'] }
  ];

  // Clean and format phone number
  private cleanPhoneNumber(phoneNumber: string): string {
    return phoneNumber.replace(/\D/g, '');
  }

  // Validate Indian phone number format
  private validateIndianNumber(cleaned: string): PhoneValidationResult {
    let number = cleaned;
    
    // Remove country code if present
    if (number.startsWith('91') && number.length === 12) {
      number = number.substring(2);
    }
    
    // Check if it's a valid 10-digit mobile number
    if (number.length !== 10) {
      return {
        isValid: false,
        formatted: cleaned,
        country: 'IN',
        confidence: 0
      };
    }

    // Indian mobile numbers start with 6, 7, 8, or 9
    if (!/^[6-9]/.test(number)) {
      return {
        isValid: false,
        formatted: cleaned,
        country: 'IN',
        confidence: 0
      };
    }

    // Detect carrier
    const prefix = number.substring(0, 2);
    let carrier = 'Unknown';
    
    for (const carrierInfo of this.INDIAN_CARRIERS) {
      if (carrierInfo.prefixes.includes(prefix)) {
        carrier = carrierInfo.name;
        break;
      }
    }

    return {
      isValid: true,
      formatted: `+91${number}`,
      country: 'IN',
      carrier,
      lineType: 'mobile',
      confidence: 0.9
    };
  }

  // Validate international phone number
  private validateInternationalNumber(cleaned: string): PhoneValidationResult {
    // Basic international validation
    if (cleaned.length < 10 || cleaned.length > 15) {
      return {
        isValid: false,
        formatted: cleaned,
        country: 'Unknown',
        confidence: 0
      };
    }

    // Common country codes
    const countryCodes = {
      '1': 'US/CA',
      '44': 'UK',
      '33': 'FR',
      '49': 'DE',
      '81': 'JP',
      '86': 'CN',
      '91': 'IN'
    };

    let country = 'Unknown';
    for (const [code, countryName] of Object.entries(countryCodes)) {
      if (cleaned.startsWith(code)) {
        country = countryName;
        break;
      }
    }

    return {
      isValid: true,
      formatted: `+${cleaned}`,
      country,
      lineType: 'mobile',
      confidence: 0.7
    };
  }

  // Main validation method
  async validatePhoneNumber(phoneNumber: string): Promise<PhoneValidationResult> {
    const cleaned = this.cleanPhoneNumber(phoneNumber);
    
    if (!cleaned) {
      return {
        isValid: false,
        formatted: phoneNumber,
        country: 'Unknown',
        confidence: 0
      };
    }

    // Check if it's an Indian number
    if (cleaned.length === 10 || (cleaned.startsWith('91') && cleaned.length === 12)) {
      return this.validateIndianNumber(cleaned);
    }

    // Validate as international number
    return this.validateInternationalNumber(cleaned);
  }

  // Check if phone number is potentially active (basic heuristics)
  async checkPhoneActivity(phoneNumber: string): Promise<{
    isLikelyActive: boolean;
    confidence: number;
    reason: string;
  }> {
    const validation = await this.validatePhoneNumber(phoneNumber);
    
    if (!validation.isValid) {
      return {
        isLikelyActive: false,
        confidence: 0,
        reason: 'Invalid phone number format'
      };
    }

    // Basic heuristics for activity check
    const cleaned = this.cleanPhoneNumber(phoneNumber);
    
    // Check for obviously fake numbers
    const fakePatterns = [
      /^(.)\1{9}$/, // All same digits (1111111111)
      /^1234567890$/, // Sequential
      /^0987654321$/, // Reverse sequential
      /^1111111111$/, // All ones
      /^0000000000$/  // All zeros
    ];

    for (const pattern of fakePatterns) {
      if (pattern.test(cleaned.slice(-10))) {
        return {
          isLikelyActive: false,
          confidence: 0.9,
          reason: 'Number appears to be fake or test number'
        };
      }
    }

    // If it has a known carrier, higher confidence
    if (validation.carrier && validation.carrier !== 'Unknown') {
      return {
        isLikelyActive: true,
        confidence: 0.8,
        reason: `Valid ${validation.carrier} number format`
      };
    }

    return {
      isLikelyActive: true,
      confidence: 0.6,
      reason: 'Valid number format, carrier unknown'
    };
  }

  // Generate phone verification challenge
  async generatePhoneChallenge(phoneNumber: string): Promise<{
    success: boolean;
    challenge?: {
      type: 'missed_call' | 'sms_back' | 'carrier_verify';
      instructions: string;
      verificationCode?: string;
      expectedResponse?: string;
    };
    message: string;
  }> {
    const validation = await this.validatePhoneNumber(phoneNumber);
    
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Invalid phone number format'
      };
    }

    const activity = await this.checkPhoneActivity(phoneNumber);
    
    if (!activity.isLikelyActive) {
      return {
        success: false,
        message: activity.reason
      };
    }

    // Generate verification challenge based on carrier/country
    if (validation.country === 'IN') {
      // For Indian numbers, use missed call verification
      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
      
      return {
        success: true,
        challenge: {
          type: 'missed_call',
          instructions: `Please give a missed call to +91-80-4718-${verificationCode.substring(0, 4)} from ${validation.formatted} within 5 minutes to verify ownership.`,
          verificationCode,
          expectedResponse: validation.formatted
        },
        message: 'Missed call verification challenge generated'
      };
    } else {
      // For international numbers, use SMS back verification
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      return {
        success: true,
        challenge: {
          type: 'sms_back',
          instructions: `Reply to this email with 'VERIFY ${verificationCode}' sent from your phone ${validation.formatted} via SMS to complete verification.`,
          verificationCode,
          expectedResponse: `VERIFY ${verificationCode}`
        },
        message: 'SMS back verification challenge generated'
      };
    }
  }

  // Verify phone challenge response
  async verifyPhoneChallenge(
    phoneNumber: string, 
    challengeType: string, 
    expectedCode: string, 
    receivedResponse: string
  ): Promise<{
    success: boolean;
    message: string;
    confidence: number;
  }> {
    const validation = await this.validatePhoneNumber(phoneNumber);
    
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Invalid phone number',
        confidence: 0
      };
    }

    switch (challengeType) {
      case 'missed_call':
        // In a real implementation, you'd check your telecom logs
        // For now, we'll simulate based on the expected pattern
        if (receivedResponse === validation.formatted) {
          return {
            success: true,
            message: 'Phone number verified via missed call',
            confidence: 0.95
          };
        }
        break;
        
      case 'sms_back':
        if (receivedResponse === `VERIFY ${expectedCode}`) {
          return {
            success: true,
            message: 'Phone number verified via SMS response',
            confidence: 0.9
          };
        }
        break;
    }

    return {
      success: false,
      message: 'Phone verification challenge failed',
      confidence: 0
    };
  }
}

export const phoneValidationService = new PhoneValidationService();
export default phoneValidationService;
